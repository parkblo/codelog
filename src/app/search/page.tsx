import { getPostsAction } from "@/actions/post.action";
import Post from "@/components/home/Post";
import { Search as SearchIcon } from "lucide-react";
import { Suspense } from "react";
import { sanitizeSearchQuery } from "@/utils/search";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
  const { data, error } = await getPostsAction({ keyword: query });

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
          <p>&quot;{query}&quot;에 대한 검색 결과가 없습니다.</p>
        </div>
      ) : (
        data.map((post) => <Post key={post.id} post={post} fullPage={false} />)
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = sanitizeSearchQuery(q);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold px-2 flex gap-2 items-center">
          <SearchIcon className="w-5 h-5" />
          {query ? (
            <span>&quot;{query}&quot; 검색 결과</span>
          ) : (
            <span>검색 결과</span>
          )}
        </h1>
        {query && (
          <p className="text-sm text-muted-foreground">
            전체 게시글 중에서 검색된 결과입니다.
          </p>
        )}
      </div>

      <Suspense fallback={<div className="p-4 text-center">검색 중...</div>}>
        {query ? (
          <SearchResults query={query} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p>검색어를 입력해 주세요.</p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
