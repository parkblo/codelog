import { notFound } from "next/navigation";

import { CreatePostForm } from "@/widgets/create-post";
import { PostCard } from "@/widgets/post-card";
import { UserProfileCard } from "@/widgets/user-profile";
import { getPostListAction } from "@/features/post-list";
import { ContributionGraph, ProfileTabs } from "@/features/profile";
import { FollowService } from "@/entities/follow/api/follow.service";
import { ServerAuthService } from "@/entities/user";
import { UserService } from "@/entities/user/api/user.service";

interface ProfilePageProps {
  username: string;
  tab?: string;
}

export async function ProfilePage({
  username,
  tab = "posts",
}: ProfilePageProps) {
  const authService = new ServerAuthService();
  const userService = new UserService();
  const followService = new FollowService();

  const currentUser = await authService.getCurrentUser();
  const { data: user, error } = await userService.getUserByUsername(
    username,
    currentUser?.id,
  );

  if (error) {
    throw new Error(error.message || "사용자 정보를 불러오는데 실패했습니다.");
  }

  if (!user) {
    notFound();
  }

  const [followersResult, followingResult] = await Promise.all([
    followService.getFollowersCount(user.id),
    followService.getFollowingCount(user.id),
  ]);

  const followerCount = followersResult?.data ?? 0;
  const followingCount = followingResult?.data ?? 0;

  const { data: posts } = await getPostListAction(
    tab === "likes" ? { likedByUserId: user.id } : { authorId: user.id },
  );

  const { data: contributions } = await userService.getUserContributions(
    user.id,
  );

  return (
    <div className="p-4 space-y-4">
      <UserProfileCard
        user={user}
        isEditable={(currentUser && user.id === currentUser.id) || false}
        followerCount={followerCount || 0}
        followingCount={followingCount || 0}
        isFollowing={user.is_following || false}
      />
      {contributions && <ContributionGraph contributions={contributions} />}
      <ProfileTabs username={username} />
      {currentUser && user.id === currentUser.id && tab === "posts" && (
        <CreatePostForm />
      )}
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
