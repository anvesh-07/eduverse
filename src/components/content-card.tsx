import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import type { Content } from "@/lib/data";

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
  const image: ImagePlaceholder | undefined = PlaceHolderImages.find(
    (img) => img.id === content.imageId
  );

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
        <CardDescription className="text-sm text-muted-foreground">{content.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {content.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
