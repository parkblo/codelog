import { getPostsAction } from "@/actions/post.action";
import UserPosts from "./_components/UserPosts";
import UserProfileCard from "./_components/UserProfileCard";
import ContributionGraph from "./_components/ContributionGraph";
import ProfileTabs from "./_components/ProfileTabs";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import { UserService } from "@/services/user/user.service";
import PostCard from "@/components/home/PostCard";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function UserProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const authService = new ServerAuthService();
  const userService = new UserService();

  const { username } = await params;
  const { tab = "posts" } = await searchParams;

  const [currentUser, { data: user }] = await Promise.all([
    authService.getCurrentUser(),
    userService.getUserByUsername(username),
  ]);

  if (!username || !user) {
    return <div>사용자 정보를 가져올 수 없습니다.</div>;
  }

  const { data: posts } = await getPostsAction(
    tab === "likes" ? { likedByUserId: user.id } : { authorId: user.id }
  );

  const { data: contributions } = await userService.getUserContributions(
    user.id
  );

  return (
    <div className="p-4 space-y-4">
      {user && (
        <UserProfileCard
          user={user}
          isEditable={(currentUser && user.id === currentUser.id) || false}
        />
      )}
      {contributions && <ContributionGraph contributions={contributions} />}
      <ProfileTabs username={username} />
      {user && currentUser && user.id === currentUser.id && tab === "posts" && (
        <PostCard />
      )}
      {posts && <UserPosts posts={posts} />}
    </div>
  );
}
