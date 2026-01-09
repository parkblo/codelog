import WelcomeCard from "@/components/home/WelcomeCard";
import PostCard from "@/components/home/PostCard";
import Post from "@/components/home/Post";
import { getPostsAction } from "@/actions/post.action";
import { PageHeader } from "@/components/common/PageHeader";
import { MessageSquare } from "lucide-react";

export default async function CodeReviewPage() {
  const { data, error } = await getPostsAction({ isReviewEnabled: true });

  if (!data || error) {
    return <span>{error}</span>;
  }

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="코드 리뷰"
        icon={MessageSquare}
        description="훈수를 환영하는 게시글 목록입니다."
      />
      <WelcomeCard />
      <PostCard />
      {data.map((post) => (
        <Post key={post.id} post={post} fullPage={false} />
      ))}
    </div>
  );
}
