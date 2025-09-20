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
import { useState, type KeyboardEvent } from "react";
import { Loader2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { db } from "@/config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  isPaid: z.boolean().default(false),
  tags: z.array(z.string()).max(5, "You can add a maximum of 5 tags.").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditFormProps {
  contentId: string;
  initialData: {
    title: string;
    description: string;
    isPaid: boolean;
    tags?: string[];
  };
}

export function EditForm({ contentId, initialData }: EditFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [tagInput, setTagInput] = useState("");
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description,
      isPaid: initialData.isPaid,
      tags: initialData.tags || [],
    },
  });

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
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "content", contentId);
      await updateDoc(docRef, {
        ...values,
        tags: tags,
      });

      toast({
        title: "Update Successful!",
        description: "Your content has been updated.",
      });
      router.push(`/content/${contentId}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "An Error Occurred",
        description: "Something went wrong during the update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                    Press Enter to add a tag.
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
