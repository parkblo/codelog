import { getDatabaseAdapter } from "@/shared/lib/database";
import { Author } from "@/shared/types/types";

type FollowedUserRow = {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
};

type FollowerJoinRow = { follower: FollowedUserRow | null };
type FollowingJoinRow = { following: FollowedUserRow | null };
type IsFollowingRow = {
  following: {
    id: string;
    deleted_at: string | null;
  } | null;
};
type FollowersCountRow = {
  follower: {
    id: string;
    deleted_at: string | null;
  } | null;
};
type FollowingCountRow = {
  following: {
    id: string;
    deleted_at: string | null;
  } | null;
};

export async function follow(
  followerId: string,
  followingId: string,
): Promise<{ error: Error | null }> {
  if (followerId === followingId) {
    return { error: new Error("자기 자신을 팔로우할 수 없습니다.") };
  }

  const db = getDatabaseAdapter();
  const { data: targetUser, error: targetUserError } = await db.query<{ id: string }>(
    {
      table: "users",
      select: "id",
      filters: [
        { column: "id", value: followingId },
        { column: "deleted_at", operator: "is", value: null },
      ],
    },
    "maybeSingle",
  );

  if (targetUserError || !targetUser) {
    return { error: new Error("존재하지 않는 사용자입니다.") };
  }

  const { error } = await db.insert("follows", {
    follower_id: followerId,
    following_id: followingId,
  });

  return { error };
}

export async function unfollow(
  followerId: string,
  followingId: string,
): Promise<{ error: Error | null }> {
  const db = getDatabaseAdapter();

  const { error } = await db.remove("follows", [
    { column: "follower_id", value: followerId },
    { column: "following_id", value: followingId },
  ]);

  return { error };
}

export async function getFollowers(
  userId: string,
): Promise<{ data: Author[] | null; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data, error } = await db.query<FollowerJoinRow[]>({
    table: "follows",
    select: `
        follower:users!follows_follower_id_fkey!inner (
          id,
          username,
          nickname,
          avatar,
          bio
        )
      `,
    filters: [
      { column: "following_id", value: userId },
      { column: "follower.deleted_at", operator: "is", value: null },
    ],
  });

  if (error) {
    return { data: null, error };
  }

  const followerRows = data ?? [];
  const followers = followerRows
    .map((item) => item.follower)
    .filter((follower): follower is FollowedUserRow => follower !== null)
    .map((follower) => ({
      id: follower.id,
      username: follower.username,
      nickname: follower.nickname,
      avatar: follower.avatar,
      bio: follower.bio,
    }));

  return {
    data: followers,
    error: null,
  };
}

export async function getFollowing(
  userId: string,
): Promise<{ data: Author[] | null; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data, error } = await db.query<FollowingJoinRow[]>({
    table: "follows",
    select: `
        following:users!follows_following_id_fkey!inner (
          id,
          username,
          nickname,
          avatar,
          bio
        )
      `,
    filters: [
      { column: "follower_id", value: userId },
      { column: "following.deleted_at", operator: "is", value: null },
    ],
  });

  if (error) {
    return { data: null, error };
  }

  const followingRows = data ?? [];
  const following = followingRows
    .map((item) => item.following)
    .filter((followedUser): followedUser is FollowedUserRow => followedUser !== null)
    .map((followedUser) => ({
      id: followedUser.id,
      username: followedUser.username,
      nickname: followedUser.nickname,
      avatar: followedUser.avatar,
      bio: followedUser.bio,
    }));

  return {
    data: following,
    error: null,
  };
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<{ data: boolean; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data, error } = await db.query<IsFollowingRow[]>({
    table: "follows",
    select: `
          following:users!follows_following_id_fkey (
            id,
            deleted_at
          )
        `,
    filters: [
      { column: "follower_id", value: followerId },
      { column: "following_id", value: followingId },
    ],
  });

  if (error) {
    return { data: false, error };
  }

  const rows = data ?? [];
  const isActiveFollowing = rows.some(
    (item) => item.following && item.following.deleted_at === null,
  );

  return { data: isActiveFollowing, error: null };
}

export async function getFollowersCount(
  userId: string,
): Promise<{ data: number; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data, error } = await db.query<FollowersCountRow[]>({
    table: "follows",
    select: `
          follower:users!follows_follower_id_fkey (
            id,
            deleted_at
          )
        `,
    filters: [{ column: "following_id", value: userId }],
  });

  if (error) {
    return { data: 0, error };
  }

  const rows = data ?? [];
  const count = rows.filter(
    (item) => item.follower && item.follower.deleted_at === null,
  ).length;

  return { data: count, error: null };
}

export async function getFollowingCount(
  userId: string,
): Promise<{ data: number; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data, error } = await db.query<FollowingCountRow[]>({
    table: "follows",
    select: `
          following:users!follows_following_id_fkey (
            id,
            deleted_at
          )
        `,
    filters: [{ column: "follower_id", value: userId }],
  });

  if (error) {
    return { data: 0, error };
  }

  const rows = data ?? [];
  const count = rows.filter(
    (item) => item.following && item.following.deleted_at === null,
  ).length;

  return { data: count, error: null };
}
