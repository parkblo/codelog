import { notFound } from "next/navigation";

import { PostCard } from "@/widgets/post-card";
import { CommentForm } from "@/features/comment";
import { getPostDetailAction } from "@/features/post-view";
import {
  getCommentsByPostIdAction,
  getCommentsByPostIdPageAction,
} from "@/entities/comment";
import { BackButton } from "@/shared/ui/back-button";

import { PostDetailCommentsInfiniteList } from "./post-detail-comments-infinite-list";

interface PostDetailPageProps {
  postId: string;
}

export async function PostDetailPage({ postId }: PostDetailPageProps) {
  const { data: post, error } = await getPostDetailAction(Number(postId));

  const { data: reviewComments } = await getCommentsByPostIdAction(
    Number(postId),
    { type: "review" },
  );

  const { data: generalComments, hasMore: hasMoreGeneralComments } =
    await getCommentsByPostIdPageAction(Number(postId), {
      type: "general",
      offset: 0,
      limit: 10,
    });

  if (error || !post) {
    const errorMessage = error || "알 수 없는 에러가 발생했습니다.";

    if (errorMessage === "포스트를 찾을 수 없습니다." || !post) {
      notFound();
    }
    throw new Error(errorMessage || "알 수 없는 에러가 발생했습니다.");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="sticky flex gap-2 items-center w-full">
        <BackButton />
      </div>
      <PostCard post={post} fullPage comments={reviewComments || undefined} />
      <CommentForm postId={Number(postId)} />
      <PostDetailCommentsInfiniteList
        postId={Number(postId)}
        initialComments={generalComments || []}
        initialHasMore={hasMoreGeneralComments}
      />
    </div>
  );
}
