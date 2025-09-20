"use client";

import { PageHeader } from "@/components/page-header";
import { UploadForm } from "@/components/upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <PageHeader title="Upload Content" />
        <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You must be logged in to upload content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Upload Content" />
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-muted-foreground">
            Share your knowledge with the world. Fill out the form below to upload your educational content. Our AI will automatically review it for appropriateness and generate relevant tags to help others discover it.
          </p>
          <UploadForm />
        </div>
      </div>
    </>
  );
}
