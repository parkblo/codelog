import { Suspense } from "react";

import { Hash, Loader2,Search as SearchIcon } from "lucide-react";

import { PostCard } from "@/widgets/post-card";
import { getPostsAction } from "@/entities/post";
import { sanitizeSearchQuery } from "@/shared/lib/utils/search";
import { PageHeader } from "@/shared/ui/page-header";

interface SearchPageProps {
  q?: string;
  tag?: string;
}

async function SearchResults({ query, tag }: { query?: string; tag?: string }) {
  const { data, error } = await getPostsAction({
    keyword: query,
    tag: tag,
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p>
            {query || tag ? (
              <span>
                &quot;{query || `#${tag}`}&quot;에 대한 검색 결과가 없습니다.
              </span>
            ) : (
              <span>검색 결과가 없습니다.</span>
            )}
          </p>
        </div>
      ) : (
        data.map((post) => (
          <PostCard key={post.id} post={post} fullPage={false} />
        ))
      )}
    </div>
  );
}

export async function SearchPage({ q, tag: rawTag }: SearchPageProps) {
  const query = sanitizeSearchQuery(q);
  const tag = sanitizeSearchQuery(rawTag);

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        showBackButton
        icon={tag ? Hash : SearchIcon}
        title={
          tag ? (
            <span>{tag}</span>
          ) : query ? (
            <span>&quot;{query}&quot;</span>
          ) : (
            <span>검색 결과</span>
          )
        }
      />

      <Suspense
        fallback={
          <div className="p-4 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            검색 중...
          </div>
        }
      >
        {query || tag ? (
          <SearchResults query={query} tag={tag} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p>검색어를 입력하거나 태그를 선택해 주세요.</p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
