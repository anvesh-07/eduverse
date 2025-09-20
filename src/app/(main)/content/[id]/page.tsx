"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/config/firebase";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

interface ContentData {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  tags?: string[];
  isPaid?: boolean;
  status?: string;
}

export default function ContentPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchContent = async () => {
      try {
        const docRef = doc(db, "content", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DocumentData;
          if (data.status !== 'approved') {
            setError("This content is not available for viewing.");
          } else {
            setContent(data as ContentData);
          }
        } else {
          notFound();
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-5/6 mb-8" />
        <Skeleton className="aspect-video w-full" />
      </div>
    );
  }

  if (error) {
    return (
       <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
         <Alert variant="destructive">
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       </div>
    );
  }

  if (!content) {
    return notFound();
  }
  
  const isLocked = content.isPaid && !user;

  const renderContent = () => {
    const { fileType, fileUrl } = content;

    if (fileType.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={content.title}
          className="w-full rounded-lg object-contain"
        />
      );
    }
    if (fileType.startsWith("video/")) {
      return (
        <video controls src={fileUrl} className="w-full rounded-lg">
          Your browser does not support the video tag.
        </video>
      );
    }
    if (fileType === "application/pdf") {
      return (
        <div className="relative aspect-[4/5] w-full">
            <embed src={fileUrl} type="application/pdf" className="h-full w-full rounded-lg" />
        </div>
      );
    }
    return <p>Unsupported content type.</p>;
  };
  
  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{content.title}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            {content.description}
          </CardDescription>
          {content.tags && (
             <div className="flex flex-wrap gap-2 pt-4">
               {content.tags.map((tag) => (
                 <Badge key={tag} variant="secondary">
                   {tag}
                 </Badge>
               ))}
             </div>
           )}
        </CardHeader>
        <CardContent>
           {isLocked ? (
              <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 p-12 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">This is Paid Content</h3>
                  <p className="mt-2 text-muted-foreground">
                      Please log in or sign up to view this content.
                  </p>
                  <Button asChild className="mt-6">
                      <Link href="/login">Login to View</Link>
                  </Button>
              </div>
           ) : (
             renderContent()
           )}
        </CardContent>
      </Card>
    </div>
  );
}
