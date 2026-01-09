import { getPostsAction } from "@/actions/post.action";
import Post from "@/components/home/Post";
import { Search as SearchIcon, Hash, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { sanitizeSearchQuery } from "@/utils/search";
import { BackButton } from "@/components/ui/back-button";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
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
        data.map((post) => <Post key={post.id} post={post} fullPage={false} />)
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, tag } = await searchParams;
  const query = sanitizeSearchQuery(q);

  return (
    <div className="p-4 space-y-4">
      <div className="sticky flex gap-2 items-center w-full bg-background">
        <BackButton />
      </div>

      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold px-2 flex gap-2 items-center ">
          {tag ? (
            <Hash className="w-5 h-5" />
          ) : (
            <SearchIcon className="w-5 h-5" />
          )}
          {tag ? (
            <span>{tag}</span>
          ) : query ? (
            <span>&quot;{query}&quot;</span>
          ) : (
            <span>검색 결과</span>
          )}
        </h1>
      </div>

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
