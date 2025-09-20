"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { MyContentActions } from "./my-content-actions";
import { Skeleton } from "./ui/skeleton";
import { FileText } from "lucide-react";

interface UserContent {
  id: string;
  title: string;
}

export function MyContentList() {
  const { user } = useAuth();
  const [content, setContent] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "content"),
      where("ownerId", "==", user.uid),
      where("status", "!=", "archived")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userContent: UserContent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        userContent.push({
          id: doc.id,
          title: data.title,
        });
      });
      setContent(userContent);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching user content:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-2 px-2">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <p className="px-2 text-sm text-muted-foreground">
        You haven&apos;t uploaded any content yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {content.map((item) => (
        <li key={item.id} className="flex items-center justify-between group rounded-md hover:bg-muted/50">
          <Link href={`/content/${item.id}`} className="flex items-center gap-2 p-2 text-sm flex-1 truncate">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{item.title}</span>
          </Link>
          <div className="pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <MyContentActions contentId={item.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
