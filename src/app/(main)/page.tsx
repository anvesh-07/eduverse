import { ContentCard } from "@/components/content-card";
import { PageHeader } from "@/components/page-header";
import { contentData } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <PageHeader title="Home Feed" />
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contentData.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </div>
    </>
  );
}
