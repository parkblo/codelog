import { getPostsAction } from "@/entities/post/api/post.action";
import { UserProfileCard } from "@/entities/user";
import {
  ContributionGraph,
  ProfileTabs,
  UserPostList,
} from "@/features/profile";
import { ServerAuthService } from "@/entities/user/api/server-auth.service";
import { UserService } from "@/entities/user/api/user.service";
import { FollowService } from "@/entities/follow/api/follow.service";
import { CreatePostForm } from "@/features/create-post";

interface UserProfilePageProps {
  username: string;
  tab?: string;
}

export async function UserProfilePage({
  username,
  tab = "posts",
}: UserProfilePageProps) {
  const authService = new ServerAuthService();
  const userService = new UserService();
  const followService = new FollowService();

  const currentUser = await authService.getCurrentUser();
  const { data: user } = await userService.getUserByUsername(
    username,
    currentUser?.id,
  );

  if (!username || !user) {
    return <div>사용자 정보를 가져올 수 없습니다.</div>;
  }

  const [followersResult, followingResult] = await Promise.all([
    followService.getFollowersCount(user.id),
    followService.getFollowingCount(user.id),
  ]);

  const followerCount = followersResult?.data ?? 0;
  const followingCount = followingResult?.data ?? 0;

  const { data: posts } = await getPostsAction(
    tab === "likes" ? { likedByUserId: user.id } : { authorId: user.id },
  );

  const { data: contributions } = await userService.getUserContributions(
    user.id,
  );

  return (
    <div className="p-4 space-y-4">
      {user && (
        <UserProfileCard
          user={user}
          isEditable={(currentUser && user.id === currentUser.id) || false}
          followerCount={followerCount || 0}
          followingCount={followingCount || 0}
          isFollowing={user.is_following || false}
        />
      )}
      {contributions && <ContributionGraph contributions={contributions} />}
      <ProfileTabs username={username} />
      {user && currentUser && user.id === currentUser.id && tab === "posts" && (
        <CreatePostForm />
      )}
      {posts && <UserPostList posts={posts} />}
    </div>
  );
}
