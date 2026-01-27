import { PageHeader } from "@/shared/ui/page-header";
import { Hash, Loader2 } from "lucide-react";
import { SearchInput } from "@/features/search";
import { Suspense } from "react";
import { getTrendingTagsAction } from "@/actions/tag.action";
import { FeaturedTags } from "@/widgets/sidebar";

export default function ExplorePage() {
  const tagsPromise = getTrendingTagsAction(100);

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="탐색"
        icon={Hash}
        description="태그를 탐색하고 게시글을 발견해보세요."
      />

      <div className="flex flex-col items-center gap-6 mt-12">
        <div className="w-full max-w-md">
          <SearchInput />
        </div>
      </div>

      <div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground font-medium">
                태그를 불러오는 중...
              </span>
            </div>
          }
        >
          <FeaturedTags tagsPromise={tagsPromise} />
        </Suspense>
      </div>
    </div>
  );
}
