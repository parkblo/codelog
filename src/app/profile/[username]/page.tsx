import { getPostsAction } from "@/actions/post.action";
import UserPosts from "./_components/UserPosts";
import UserProfileCard from "./_components/UserProfileCard";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import { UserService } from "@/services/user/user.service";
import PostCard from "@/components/home/PostCard";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const authService = new ServerAuthService();
  const userService = new UserService();

  const { username } = await params;
  const currentUser = await authService.getCurrentUser();
  const { data: user } = await userService.getUserByUsername(username);

  if (!username || !user) {
    return <div>사용자 정보를 가져올 수 없습니다.</div>;
  }

  const { data: posts } = await getPostsAction({ authorId: user.id });

  return (
    <div className="p-4 space-y-4">
      {user && (
        <UserProfileCard
          user={user}
          isEditable={(currentUser && user.id === currentUser.id) || false}
        />
      )}
      {user && currentUser && user.id === currentUser.id && <PostCard />}
      {posts && <UserPosts posts={posts} />}
    </div>
  );
}
