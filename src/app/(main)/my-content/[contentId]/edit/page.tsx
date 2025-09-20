"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useParams, useRouter, notFound } from "next/navigation";
import { EditForm } from "@/components/edit-form";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentData } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContentData {
  title: string;
  description: string;
  isPaid: boolean;
  tags?: string[];
  ownerId: string;
}

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.contentId) ? params.contentId[0] : params.contentId;
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchContent = async () => {
      try {
        const docRef = doc(db, "content", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DocumentData;
          if (data.ownerId !== user.uid) {
            setError("You do not have permission to edit this content.");
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
  }, [id, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <>
        <PageHeader title="Edit Content" />
        <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
          <div className="mx-auto max-w-3xl">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-5/6 mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </>
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
  
  if (!user) {
     return (
       <>
         <PageHeader title="Edit Content" />
         <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
           <Card className="text-center">
             <CardHeader>
               <CardTitle>Access Denied</CardTitle>
               <CardDescription>
                 You must be logged in to edit content.
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

  if (!content) {
    return notFound();
  }

  return (
    <>
      <PageHeader title="Edit Content" />
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
        <div className="mx-auto max-w-3xl">
          <EditForm contentId={id} initialData={content} />
        </div>
      </div>
    </>
  );
}
