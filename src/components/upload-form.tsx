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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { validateContent } from "@/ai/flows/content-moderation";
import { generateTags } from "@/ai/flows/auto-tagging";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  fileType: z.enum(["text", "image", "video", "pdf"]),
});

type FormData = z.infer<typeof formSchema>;

export function UploadForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fileType: "text",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setGeneratedTags([]);
    setIsSuccess(false);

    try {
      // Step 1: Content Moderation
      const moderationResult = await validateContent(values);

      if (!moderationResult.isEducational) {
        toast({
          title: "Content Rejected",
          description: `Reason: ${moderationResult.reason}. Please upload educational content only.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Content Approved",
        description: "Your content has been approved as educational.",
      });

      // Step 2: Auto-Tagging
      const tagsResult = await generateTags({
        title: values.title,
        description: values.description,
        contentType: values.fileType,
      });

      setGeneratedTags(tagsResult.tags);
      setIsSuccess(true);
      toast({
        title: "Upload Successful!",
        description: "Your content has been moderated and tagged.",
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
              name="fileType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the format of the content you are uploading.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Analyzing..." : "Upload & Process"}
            </Button>
          </form>
        </Form>
        {isSuccess && generatedTags.length > 0 && (
          <div className="mt-8 rounded-lg border bg-secondary/50 p-4">
            <h3 className="mb-3 font-semibold">Successfully uploaded with AI-generated tags:</h3>
            <div className="flex flex-wrap gap-2">
              {generatedTags.map(tag => <Badge key={tag}>{tag}</Badge>)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
