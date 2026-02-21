import { notFound } from "next/navigation";

import { CreatePostForm } from "@/widgets/create-post";
import { PostInfiniteList } from "@/widgets/post-card";
import { UserProfileCard } from "@/widgets/user-profile";
import { getPostListPageAction } from "@/features/post-list";
import { ContributionGraph, ProfileTabs } from "@/features/profile";
import {
  getFollowersCount,
  getFollowingCount,
} from "@/entities/follow/api/follow.service";
import {
  getUserByUsername,
  getUserContributions,
} from "@/entities/user/api/user.service";
import { getCurrentUser } from "@/entities/user/server";

interface ProfilePageProps {
  username: string;
  tab?: string;
}

export async function ProfilePage({
  username,
  tab = "posts",
}: ProfilePageProps) {
  const currentUser = await getCurrentUser();
  const { data: user, error } = await getUserByUsername(username, currentUser?.id);

  if (error) {
    throw new Error(error.message || "사용자 정보를 불러오는데 실패했습니다.");
  }

  if (!user) {
    notFound();
  }

  const [followersResult, followingResult] = await Promise.all([
    getFollowersCount(user.id),
    getFollowingCount(user.id),
  ]);

  const followerCount = followersResult?.data ?? 0;
  const followingCount = followingResult?.data ?? 0;

  const postFilterOptions =
    tab === "likes" ? { likedByUserId: user.id } : { authorId: user.id };

  const { data: posts, error: postError, hasMore } = await getPostListPageAction(
    {
      ...postFilterOptions,
      offset: 0,
      limit: 10,
    },
  );

  if (postError || !posts) {
    throw new Error(postError || "게시글을 불러오는데 실패했습니다.");
  }

  const { data: contributions } = await getUserContributions(user.id);

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
      <PostInfiniteList
        initialPosts={posts}
        initialHasMore={hasMore}
        filterOptions={postFilterOptions}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p>
              {tab === "likes"
                ? "좋아요한 게시글이 없습니다."
                : "작성한 게시글이 없습니다."}
            </p>
          </div>
        }
      />
    </div>
  );
}
