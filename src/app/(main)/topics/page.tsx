"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { allTags } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

export default function TopicsPage() {
  const [followedTags, setFollowedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setFollowedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <PageHeader title="Topics" />
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Follow Topics</CardTitle>
            <CardDescription>
              Select topics you're interested in to personalize your home feed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {allTags.map((tag) => {
                const isFollowed = followedTags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)} aria-pressed={isFollowed}>
                    <Badge
                      className={cn(
                        "cursor-pointer text-base px-4 py-2 transition-all",
                        isFollowed
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {isFollowed && <Check className="mr-2 h-4 w-4" />}
                      {tag}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
