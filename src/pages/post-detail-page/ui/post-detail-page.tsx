import { notFound } from "next/navigation";

import { PostCard } from "@/widgets/post-card";
import { CommentForm } from "@/features/comment";
import { CommentItem } from "@/entities/comment";
import { getCommentsByPostIdAction } from "@/entities/comment";
import { getPostByIdAction } from "@/entities/post";
import { BackButton } from "@/shared/ui/back-button";

interface PostDetailPageProps {
  postId: string;
}

export async function PostDetailPage({ postId }: PostDetailPageProps) {
  const { data: post, error } = await getPostByIdAction(Number(postId));

  const { data: comments } = await getCommentsByPostIdAction(Number(postId));

  if (error || !post) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error);

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
      <PostCard post={post} fullPage comments={comments || undefined} />
      <CommentForm postId={Number(postId)} />
      {comments
        ?.filter(
          (comment) => comment.start_line === null || comment.end_line === null,
        )
        .map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
    </div>
  );
}
