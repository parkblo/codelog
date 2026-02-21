import { getDatabaseAdapter } from "@/shared/lib/database";
import { Author, UserAuth, UserContribution } from "@/shared/types/types";

type UserProfileRow = Pick<UserAuth, "id" | "username" | "nickname" | "bio" | "avatar">;
type FollowRow = { following_id: string };
type FeaturedUserIdRow = { id: string };

export async function editUser(
  user: Pick<UserAuth, "id" | "nickname" | "bio" | "avatar">,
) {
  const { id, nickname, bio, avatar } = user;
  const db = getDatabaseAdapter();

  return db.update(
    "users",
    {
      nickname,
      bio,
      avatar,
    },
    [
      { column: "id", value: id },
      { column: "deleted_at", operator: "is", value: null },
    ],
  );
}

export async function getUserByUsername(username: string, currentUserId?: string) {
  const db = getDatabaseAdapter();

  const { data: userData, error: userError } = await db.query<UserProfileRow>(
    {
      table: "users",
      select: "id, username, nickname, bio, avatar",
      filters: [
        { column: "username", value: username },
        { column: "deleted_at", operator: "is", value: null },
      ],
    },
    "single",
  );

  if (userError || !userData) {
    return { data: null, error: userError };
  }

  let isFollowing = false;

  if (currentUserId) {
    const { data: followData, error: followError } = await db.query<{
      follower_id: string;
    }>(
      {
        table: "follows",
        select: "follower_id",
        filters: [
          { column: "following_id", value: userData.id },
          { column: "follower_id", value: currentUserId },
        ],
        limit: 1,
      },
      "maybeSingle",
    );

    if (!followError && followData) {
      isFollowing = true;
    }
  }

  return {
    data: {
      ...userData,
      is_following: isFollowing,
    } as UserAuth & { is_following?: boolean },
    error: null,
  };
}

export async function getUserContributions(userId: string) {
  const db = getDatabaseAdapter();

  const { data, error } = await db.rpc<UserContribution[]>("get_user_contributions", {
    target_user_id: userId,
  });

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? [], error: null };
}

export async function updateAvatar(id: string, avatar: string) {
  const db = getDatabaseAdapter();

  const { error: dbError } = await db.update(
    "users",
    { avatar },
    [
      { column: "id", value: id },
      { column: "deleted_at", operator: "is", value: null },
    ],
  );

  if (dbError) {
    return { error: dbError };
  }

  const { error: authError } = await db.updateCurrentAuthUserMetadata({
    avatar_url: avatar,
  });

  if (authError) {
    return { error: authError };
  }

  return { error: null };
}

export async function getRandomFeaturedUsers(count: number, currentUserId?: string) {
  const db = getDatabaseAdapter();

  const fetchCount = currentUserId ? count + 1 : count;
  const { data: featuredIds, error: rpcError } = await db.rpc<FeaturedUserIdRow[]>(
    "get_random_featured_users",
    { p_count: fetchCount },
  );

  if (rpcError || !featuredIds) {
    return { data: null, error: rpcError };
  }

  const ids = featuredIds
    .map((user) => user.id)
    .filter((id) => id !== currentUserId)
    .slice(0, count);

  if (ids.length === 0) {
    return { data: [], error: null };
  }

  const { data: usersData, error: usersError } = await db.query<UserProfileRow[]>({
    table: "users",
    select: "id, username, nickname, bio, avatar",
    filters: [
      { column: "id", operator: "in", value: ids },
      { column: "deleted_at", operator: "is", value: null },
    ],
  });

  if (usersError || !usersData) {
    return { data: null, error: usersError };
  }

  let followedIds = new Set<string>();

  if (currentUserId && usersData.length > 0) {
    const { data: follows } = await db.query<FollowRow[]>({
      table: "follows",
      select: "following_id",
      filters: [
        { column: "follower_id", value: currentUserId },
        {
          column: "following_id",
          operator: "in",
          value: usersData.map((user) => user.id),
        },
      ],
    });

    if (follows) {
      followedIds = new Set(follows.map((follow) => follow.following_id));
    }
  }

  const users = usersData.map((user) => ({
    ...user,
    is_following: followedIds.has(user.id),
  }));

  return {
    data: users as Author[],
    error: null,
  };
}
