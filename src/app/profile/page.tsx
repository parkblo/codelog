import { getPostsAction } from "@/actions/post.action";
import MyPosts from "./_components/MyPosts";
import MyProfileCard from "./_components/MyProfileCard";
import { ServerAuthService } from "@/services/auth/server-auth.service";

export default async function ProfilePage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return <div>사용자 정보를 가져올 수 없습니다.</div>;
  }

  const { data: posts } = await getPostsAction({ authorId: user.id });

  return (
    <div className="p-4 space-y-4">
      <MyProfileCard user={user} />
      <MyPosts posts={posts || []} />
    </div>
  );
}
