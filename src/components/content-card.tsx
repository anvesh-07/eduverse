import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Video, Image as ImageIcon, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { Content } from "@/lib/data";

interface ContentCardProps {
  content: Content & { fileType?: string; fileUrl?: string; id: string };
}

export function ContentCard({ content }: ContentCardProps) {
  const renderPreview = () => {
    if (!content.fileType || !content.fileUrl) {
      return (
        <div className="flex h-full items-center justify-center bg-secondary">
          <ImageIcon className="h-16 w-16 text-muted-foreground" />
        </div>
      );
    }
    if (content.fileType.startsWith("image/")) {
      return (
        <Image
          src={content.fileUrl}
          alt={content.title}
          fill
          className="object-cover"
        />
      );
    }
    if (content.fileType.startsWith("video/")) {
      return (
        <div className="relative h-full w-full bg-black">
          <video
            src={content.fileUrl}
            className="h-full w-full object-cover"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <PlayCircle className="h-12 w-12 text-white" />
          </div>
        </div>
      );
    }
    if (content.fileType === "application/pdf") {
      return (
         <div className="flex h-full items-center justify-center bg-secondary p-4">
          <FileText className="h-16 w-16 text-muted-foreground" />
        </div>
      );
    }
    return (
        <div className="flex h-full items-center justify-center bg-secondary">
          <ImageIcon className="h-16 w-16 text-muted-foreground" />
        </div>
      );
  };

  return (
    <Link href={`/content/${content.id}`} className="block h-full">
        <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="relative aspect-video">
                {renderPreview()}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
                <CardTitle className="mb-2 text-lg font-semibold leading-tight">{content.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground line-clamp-2">{content.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
                {content.tags && content.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                    {tag}
                    </Badge>
                ))}
            </CardFooter>
        </Card>
    </Link>
  );
}
