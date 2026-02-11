import { Bookmark } from "lucide-react";

import { PostInfiniteList } from "@/widgets/post-card";
import { requireAuth } from "@/features/auth/server";
import { getPostListPageAction } from "@/features/post-list";
import { PageHeader } from "@/shared/ui/page-header";

export async function BookmarksPage() {
  const user = await requireAuth("/bookmarks");

  const { data, error, hasMore } = await getPostListPageAction({
    bookmarkedByUserId: user.id,
    offset: 0,
    limit: 10,
  });

  if (error || !data) {
    throw new Error(error || "저장한 게시글을 불러오는데 실패했습니다.");
  }

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="저장한 게시글"
        icon={Bookmark}
        description="저장한 게시글 목록은 나에게만 표시됩니다."
      />

      <PostInfiniteList
        initialPosts={data}
        initialHasMore={hasMore}
        filterOptions={{ bookmarkedByUserId: user.id }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p>저장한 게시글이 없습니다.</p>
          </div>
        }
      />
    </div>
  );
}
