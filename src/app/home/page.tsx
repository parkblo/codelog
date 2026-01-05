import { getPostsAction } from "@/actions/post.action";
import Post from "@/components/home/Post";
import PostCard from "@/components/home/PostCard";
import WelcomeCard from "@/components/home/WelcomeCard";

export default async function HomePage() {
  const { data, error } = await getPostsAction();

  if (!data || error) {
    return (
      <div className="p-4 space-y-4">
        <WelcomeCard />
        <PostCard />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <WelcomeCard />
      <PostCard />
      {data.map((post) => (
        <Post key={post.id} post={post} fullPage={false} />
      ))}
    </div>
  );
}
