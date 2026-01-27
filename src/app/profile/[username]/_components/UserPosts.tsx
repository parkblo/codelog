import { PostCard } from "@/widgets/post-card";
import { Post as PostType } from "@/shared/types/types";

export default function UserPosts({ posts }: { posts: PostType[] }) {
  return posts.map((post) => (
    <PostCard key={post.id} post={post} fullPage={false} />
  ));
}
