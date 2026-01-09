import WelcomeCard from "@/components/home/WelcomeCard";
import PostCard from "@/components/home/PostCard";
import Post from "@/components/home/Post";
import { getPostsAction } from "@/actions/post.action";
import { MessageSquare } from "lucide-react";

export default async function CodeReviewPage() {
  const { data, error } = await getPostsAction({ isReviewEnabled: true });

  if (!data || error) {
    return <span>{error}</span>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold px-2 flex gap-2 items-center">
          <MessageSquare /> 코드 리뷰
        </h1>
        <p className="text-sm text-muted-foreground text-right hidden sm:block">
          훈수를 환영하는 게시글 목록입니다.
        </p>
      </div>
      <WelcomeCard />
      <PostCard />
      {data.map((post) => (
        <Post key={post.id} post={post} fullPage={false} />
      ))}
    </div>
  );
}
