"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/config/firebase";
import { ContentCard } from "@/components/content-card";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { Content } from "@/lib/data";

export default function HomePage() {
  const [content, setContent] = useState<(Content & { fileType?: string; fileUrl?: string; id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "content"), where("status", "==", "approved"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const approvedContent: (Content & { fileType?: string; fileUrl?: string; id: string })[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        approvedContent.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          imageId: data.imageId || "1", 
          tags: data.tags || [],
          fileType: data.fileType,
          fileUrl: data.fileUrl,
        });
      });
      setContent(approvedContent);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <PageHeader title="Home Feed" />
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[225px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            ))
          ) : content.length > 0 ? (
            content.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground">
              <p>No content has been approved yet. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
