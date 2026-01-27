import { getPostsAction } from "@/actions/post.action";
import { PostCard } from "@/widgets/post-card";
import { CreatePostForm } from "@/features/create-post";
import { WelcomeCard } from "@/widgets/sidebar";

export default async function HomePage() {
  const { data, error } = await getPostsAction();

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
      {data.map((post) => (
        <PostCard key={post.id} post={post} fullPage={false} />
      ))}
    </div>
  );
}
