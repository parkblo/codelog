import Post from "@/components/home/Post";
import CommentForm from "./_components/CommentForm";
import Comment from "./_components/Comment";
import { getPostByIdAction } from "@/actions/post.action";
import { getCommentsByPostIdAction } from "@/actions/comment.action";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;

  const { data: post, error } = await getPostByIdAction(Number(postId));

  const { data: comments, error: commentError } =
    await getCommentsByPostIdAction(Number(postId));

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
      <Post post={post} fullPage comments={comments || undefined} />
      <CommentForm postId={Number(postId)} />
      {comments
        ?.filter(
          (comment) => comment.start_line === null || comment.end_line === null
        )
        .map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
    </div>
  );
}
