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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { db, storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";

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
});

type FormData = z.infer<typeof formSchema>;

export function UploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isPaid: false,
    },
  });

  async function onSubmit(values: FormData) {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      // 1. Upload file to Firebase Storage
      const file = values.file;
      const storageRef = ref(storage, `content-files/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Create document in Firestore
      await addDoc(collection(db, "content"), {
        title: values.title,
        description: values.description,
        isPaid: values.isPaid,
        fileUrl: downloadURL,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setIsSuccess(true);
      toast({
        title: "Upload Successful!",
        description: "Your content has been uploaded and is pending review.",
      });
      form.reset();

    } catch (error) {
      console.error("Upload process failed:", error);
      toast({
        title: "An Error Occurred",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
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
             <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Uploading..." : "Upload Content"}
            </Button>
          </form>
        </Form>
        {isSuccess && (
          <div className="mt-8 rounded-lg border bg-secondary/50 p-4">
            <h3 className="mb-3 font-semibold">Content Uploaded!</h3>
            <p className="text-sm text-muted-foreground">Your content has been submitted successfully and is now waiting for approval.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
