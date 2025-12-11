import Post from "@/components/home/Post";
import { BackButton } from "@/components/ui/back-button";
import CommentForm from "./_components/CommentForm";
import Comment from "./_components/Comment";
import { getPostByIdAction } from "@/actions/post.action";
import { getCommentsByPostIdAction } from "@/actions/comment.action";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;

  const { data: post, error } = await getPostByIdAction(Number(postId));

  const { data: comments, error: commentError } =
    await getCommentsByPostIdAction(Number(postId));

  if (error || !post) {
    return <div>[Error]{error instanceof Error ? error.message : error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="sticky flex gap-2 items-center w-full bg-background">
        <BackButton />
      </div>
      <Post post={post} fullPage />
      <CommentForm postId={Number(postId)} />
      {comments?.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
