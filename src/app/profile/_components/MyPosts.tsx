import Post from "@/components/home/Post";
import { Post as PostType } from "@/types/types";

export default function MyPosts({ posts }: { posts: PostType[] }) {
  return posts.map((post) => (
    <Post key={post.id} post={post} fullPage={false} />
  ));
}
