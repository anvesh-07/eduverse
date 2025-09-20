import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import type { Content } from "@/lib/data";
import { FileText, Video, Image as ImageIcon } from "lucide-react";

interface ContentCardProps {
  content: Content & { fileType?: string };
}

export function ContentCard({ content }: ContentCardProps) {
  const image: ImagePlaceholder | undefined = PlaceHolderImages.find(
    (img) => img.id === content.imageId
  );

  const renderFileTypeIcon = () => {
    if (!content.fileType) return null;
    if (content.fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
    }
    if (content.fileType.startsWith("video/")) {
      return <Video className="h-4 w-4 text-muted-foreground" />;
    }
    if (content.fileType === "application/pdf") {
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
    return null;
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          {image && (
            <Image
              src={image.imageUrl}
              alt={content.title}
              fill
              className="object-cover"
              data-ai-hint={image.imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2 text-lg font-semibold leading-tight">{content.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">{content.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {content.tags && content.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        {renderFileTypeIcon()}
      </CardFooter>
    </Card>
  );
}
