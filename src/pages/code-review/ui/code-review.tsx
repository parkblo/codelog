import { MessageSquare } from "lucide-react";

import { CreatePostForm } from "@/widgets/create-post";
import { PostInfiniteList } from "@/widgets/post-card";
import { WelcomeCard } from "@/widgets/sidebar";
import { getPostListPageAction } from "@/features/post-list";
import { PageHeader } from "@/shared/ui/page-header";

export async function CodeReviewPage() {
  const { data, error, hasMore } = await getPostListPageAction({
    isReviewEnabled: true,
    offset: 0,
    limit: 10,
  });

  if (error || !data) {
    throw new Error(error || "게시글을 불러오는데 실패했습니다.");
  }

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="코드 리뷰"
        icon={MessageSquare}
        description="훈수를 환영하는 게시글 목록입니다."
      />
      <WelcomeCard />
      <CreatePostForm />
      <PostInfiniteList
        initialPosts={data}
        initialHasMore={hasMore}
        filterOptions={{ isReviewEnabled: true }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p>코드 리뷰 게시글이 없습니다.</p>
          </div>
        }
      />
    </div>
  );
}
