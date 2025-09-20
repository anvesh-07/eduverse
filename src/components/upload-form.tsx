"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyboardEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, UploadCloud, ShieldCheck, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { db, storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc, writeBatch, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { validateContent } from "@/ai/flows/content-moderation";
import { generateTags } from "@/ai/flows/auto-tagging";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "application/pdf"];

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  file: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .jpg, .png, .webp, .mp4 and .pdf files are accepted."
    ),
  isPaid: z.boolean().default(false),
  tags: z.array(z.string()).max(5, "You can add a maximum of 5 tags.").optional(),
});

type FormData = z.infer<typeof formSchema>;

type ModerationStatus = "pending" | "approved" | "rejected" | null;
type UploadStage = "idle" | "uploading" | "verifying" | "tagging" | "completed";

const stageDetails = {
  uploading: {
    icon: UploadCloud,
    title: "Uploading Content",
    description: "Your file is being uploaded to our servers. Please wait.",
    progress: 25,
  },
  verifying: {
    icon: ShieldCheck,
    title: "Verifying Content",
    description: "Our AI is analyzing your content to ensure it's educational.",
    progress: 50,
  },
  tagging: {
    icon: ShieldCheck,
    title: "Generating Tags",
    description: "Our AI is generating relevant tags for your content.",
    progress: 75,
  },
  completed: {
    icon: CheckCircle2,
    title: "Process Completed",
    description: "Your content has been successfully processed.",
    progress: 100,
  },
};

export function UploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isPaid: false,
      tags: [],
    },
  });

  useEffect(() => {
    form.setValue("tags", tags);
  }, [tags, form]);
  
  useEffect(() => {
    if (!lastDocId) return;

    const unsubscribe = onSnapshot(doc(db, "content", lastDocId), (doc) => {
      const data = doc.data();
      if (data && data.status && data.status !== 'pending') {
        setModerationStatus(data.status);
        setModerationReason(data.reason || "");
        if(uploadStage === 'tagging' || uploadStage === 'verifying') {
          setUploadStage("completed");
          setTimeout(() => {
            setIsProgressDialogOpen(false);
            router.push('/');
          }, 3000);
        }
      }
    });

    return () => unsubscribe();
  }, [lastDocId, uploadStage, router]);

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  async function onSubmit(values: FormData) {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setModerationStatus(null);
    setModerationReason("");
    setLastDocId(null);
    setUploadStage("idle");
    setIsProgressDialogOpen(true);

    try {
      // 1. Upload file to Firebase Storage
      setUploadStage("uploading");
      const file = values.file;
      const storageRef = ref(storage, `content-files/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Create document in Firestore
      const docRef = await addDoc(collection(db, "content"), {
        title: values.title,
        description: values.description,
        isPaid: values.isPaid,
        fileUrl: downloadURL,
        fileType: file.type,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        status: "pending",
        tags: [], // Initially empty
      });
      
      setLastDocId(docRef.id);
      
      // 3. Start AI content moderation
      setUploadStage("verifying");
      const moderationResult = await validateContent({
        title: values.title,
        description: values.description,
        fileType: file.type,
      });

      const newStatus = moderationResult.isEducational ? "approved" : "rejected";
      
      if (newStatus === 'rejected') {
        await updateDoc(docRef, {
          status: 'rejected',
          reason: moderationResult.reason,
        });
        toast({
          title: "Content Rejected",
          description: "Your content could not be approved.",
          variant: "destructive",
        });
        return;
      }
      
      setUploadStage("tagging");
      const tagResult = await generateTags({
        title: values.title,
        description: values.description,
        contentType: file.type.split('/')[0] as 'text' | 'image' | 'video'
      });
      
      const userTags = values.tags || [];
      const combinedTags = [...new Set([...userTags, ...tagResult.tags].map(t => t.toLowerCase()))];

      const batch = writeBatch(db);
      
      batch.update(docRef, {
        status: newStatus,
        reason: moderationResult.reason,
        tags: combinedTags,
      });

      await batch.commit();
      
      toast({
        title: "Upload Successful!",
        description: "Your content has been uploaded and moderated.",
      });
      form.reset();
      setTags([]);

    } catch (error) {
      console.error("Upload process failed:", error);
      setModerationStatus(null);
      setUploadStage("idle");
      setIsProgressDialogOpen(false);
      toast({
        title: "An Error Occurred",
        description: "Something went wrong during the upload or moderation process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderStatusAlert = () => {
    if (uploadStage !== 'completed' || !moderationStatus) return null;

    switch (moderationStatus) {
      case "approved":
        return (
          <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-600" />
            <AlertTitle>Content Approved!</AlertTitle>
            <AlertDescription>
              {moderationReason || "Your content meets our guidelines and has been approved."}
            </AlertDescription>
          </Alert>
        );
      case "rejected":
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Content Rejected</AlertTitle>
            <AlertDescription>
              {moderationReason || "Your content does not meet our educational guidelines."}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const renderProgressIndicator = () => {
    if (uploadStage === 'idle' || !isSubmitting) return null;
    
    const currentStageDetails = uploadStage !== 'completed' ? stageDetails[uploadStage] : stageDetails.completed;
    const Icon = currentStageDetails.icon;

    return (
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium">{currentStageDetails.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStageDetails.description}</p>
          </div>
        </div>
        <Progress value={currentStageDetails.progress} className="mt-4" />
        {uploadStage === "completed" && <div className="mt-4">{renderStatusAlert()}</div>}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Introduction to Quantum Physics" {...field} />
                    </FormControl>
                    <FormDescription>
                      A concise and descriptive title for your content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed summary of your educational content..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain what learners will get from your content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                  <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                          placeholder="Add up to 5 tags..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          disabled={tags.length >= 5}
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                              {tag}
                              <button
                                  type="button"
                                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => removeTag(tag)}
                              >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove {tag}</span>
                              </button>
                              </Badge>
                          ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                      Press Enter to add a tag. Helps users discover your content.
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Content File</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept={ACCEPTED_FILE_TYPES.join(",")}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }} 
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload your content file (image, video, or PDF). Max 5MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPaid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Paid Content
                      </FormLabel>
                      <FormDescription>
                        Is this content behind a paywall?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Processing..." : "Upload & Moderate Content"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Content Processing</DialogTitle>
            <DialogDescription>
              Please wait while we process your content. This may take a moment.
            </DialogDescription>
          </DialogHeader>
          {renderProgressIndicator()}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper to hide the close button on the dialog
const DialogContentWithNoClose = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> & { hideCloseButton?: boolean }
>(({ children, hideCloseButton, ...props }, ref) => {
  return (
    <DialogContent ref={ref} {...props}>
      {children}
      {hideCloseButton && <div />}
    </DialogContent>
  );
});
DialogContentWithNoClose.displayName = "DialogContentWithNoClose"
