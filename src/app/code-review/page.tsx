import { WelcomeCard } from "@/widgets/sidebar";
import { PostCard } from "@/widgets/post-card";
import { CreatePostForm } from "@/features/create-post";
// removed duplicate
import { getPostsAction } from "@/entities/post/api/post.action";
import { PageHeader } from "@/shared/ui/page-header";
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
      <CreatePostForm />
      {data.map((post) => (
        <PostCard key={post.id} post={post} fullPage={false} />
      ))}
    </div>
  );
}
