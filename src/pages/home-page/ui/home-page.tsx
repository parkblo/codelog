import { CreatePostForm } from "@/widgets/create-post";
import { PostCard } from "@/widgets/post-card";
import { WelcomeCard } from "@/widgets/sidebar";
import { getPostListAction } from "@/features/post-list";
import { Post } from "@/shared/types";

export async function HomePage() {
  const { data, error } = await getPostListAction({});

  if (!data || error) {
    return (
      <div className="p-4 space-y-4">
        <WelcomeCard />
        <CreatePostForm />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <WelcomeCard />
      <CreatePostForm />
      {data.map((post: Post) => (
        <PostCard key={post.id} post={post} fullPage={false} />
      ))}
    </div>
  );
}
