import { getDatabaseAdapter } from "@/shared/lib/database";
import {
  getLocalDateKey,
  isValidLocalDayContext,
  type LocalDayContext,
} from "@/shared/lib/date";
import { Database, Tables } from "@/shared/types/database.types";
import { Post } from "@/shared/types/types";

import { CreatePostDTO } from "./post.interface";

type PostQueryResult = Tables<"posts"> & {
  author: Tables<"users">;
  tags: { tags: { name: string } | null }[] | null;
};

type LocalDayQueryOptions = LocalDayContext & {
  userId: string;
};

type LocalDayListQueryOptions = LocalDayContext & {
  followingIds?: string[];
  offset?: number;
  limit?: number;
};

function sanitizeKeywordForOrFilter(rawKeyword: string): string {
  return rawKeyword.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}

function mapPostRows(data: PostQueryResult[] | null | undefined): Post[] {
  return (data ?? []).map((post) => ({
    ...post,
    tags:
      post.tags
        ?.map((postTag) => postTag.tags?.name)
        .filter((name): name is string => !!name) ?? [],
  }));
}

function compareLocalDateDescending(
  firstCreatedAt: string,
  secondCreatedAt: string,
  timezoneOffsetMinutes: number,
) {
  const firstDateKey = getLocalDateKey(firstCreatedAt, timezoneOffsetMinutes);
  const secondDateKey = getLocalDateKey(secondCreatedAt, timezoneOffsetMinutes);

  if (!firstDateKey || !secondDateKey || firstDateKey === secondDateKey) {
    return 0;
  }

  return firstDateKey < secondDateKey ? 1 : -1;
}

function sortPostsForLocalDay(
  posts: Post[],
  followingIds: Set<string>,
  timezoneOffsetMinutes: number,
) {
  return [...posts].sort((firstPost, secondPost) => {
    const localDateCompare = compareLocalDateDescending(
      firstPost.created_at,
      secondPost.created_at,
      timezoneOffsetMinutes,
    );

    if (localDateCompare !== 0) {
      return localDateCompare;
    }

    const firstIsFollowing = followingIds.has(firstPost.author.id);
    const secondIsFollowing = followingIds.has(secondPost.author.id);

    if (firstIsFollowing !== secondIsFollowing) {
      return firstIsFollowing ? -1 : 1;
    }

    return (
      new Date(secondPost.created_at).getTime() -
      new Date(firstPost.created_at).getTime()
    );
  });
}

export async function createPost(
  data: CreatePostDTO,
): Promise<{ data: Post | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  const postData: Database["public"]["Functions"]["create_post_with_tags"]["Args"]["post_data"] =
    {
      content: data.content,
      code: data.code,
      language: data.language,
      user_id: data.author.id,
      is_review_enabled: data.is_review_enabled,
    };

  const { data: insertedPost, error } = await db.rpc<Tables<"posts">>(
    "create_post_with_tags",
    {
      post_data: postData,
      tags: data.tags,
    },
  );

  if (error || !insertedPost) {
    return { data: null, error };
  }

  const newPost: Post = {
    ...insertedPost,
    author: data.author,
    tags: data.tags,
  };

  return { data: newPost, error: null };
}

export async function getPosts({
  isReviewEnabled = false,
  authorId,
  likedByUserId,
  bookmarkedByUserId,
  keyword,
  tag,
  offset,
  limit,
}: {
  isReviewEnabled?: boolean;
  authorId?: string;
  likedByUserId?: string;
  bookmarkedByUserId?: string;
  keyword?: string;
  tag?: string;
  offset?: number;
  limit?: number;
} = {}): Promise<{ data: Post[] | null; error: Error | null }> {
  const db = getDatabaseAdapter();

  let selectString = `
      *,
      author:users!posts_user_id_fkey!inner(*),
      tags:posttags(tags(*))`;

  const filters: {
    column: string;
    value: unknown;
    operator?: "eq" | "is";
  }[] = [
    { column: "deleted_at", operator: "is", value: null },
    { column: "author.deleted_at", operator: "is", value: null },
  ];

  if (likedByUserId) {
    selectString += `, post_likes!inner(user_id)`;
    filters.push({ column: "post_likes.user_id", value: likedByUserId });
  }

  if (bookmarkedByUserId) {
    selectString += `, bookmarks!inner(user_id)`;
    filters.push({ column: "bookmarks.user_id", value: bookmarkedByUserId });
  }

  if (tag) {
    selectString += `, filter_tags:posttags!inner(tags!inner(name))`;
    filters.push({ column: "filter_tags.tags.name", value: tag });
  }

  if (isReviewEnabled) {
    filters.push({ column: "is_review_enabled", value: true });
  }

  if (authorId) {
    filters.push({ column: "user_id", value: authorId });
  }

  const safeLimit = limit && limit > 0 ? limit : undefined;
  const safeOffset = Math.max(0, offset ?? 0);
  const sanitizedKeyword = keyword ? sanitizeKeywordForOrFilter(keyword) : "";
  const escapedKeyword = sanitizedKeyword
    ? sanitizedKeyword.replace(/[\\%_]/g, "\\$&")
    : null;

  const { data, error } = await db.query<PostQueryResult[]>({
    table: "posts",
    select: selectString,
    filters,
    or: escapedKeyword
      ? `content.ilike.%${escapedKeyword}%,code.ilike.%${escapedKeyword}%`
      : undefined,
    orderBy: { column: "created_at", ascending: false },
    range:
      typeof safeLimit === "number"
        ? { from: safeOffset, to: safeOffset + safeLimit - 1 }
        : undefined,
  });

  if (error) {
    return { data: null, error };
  }

  const posts = mapPostRows(data);

  return { data: posts, error: null };
}

export async function hasUserPostedOnLocalDay({
  userId,
  ...localDayContext
}: LocalDayQueryOptions): Promise<{ data: boolean | null; error: Error | null }> {
  if (!isValidLocalDayContext(localDayContext)) {
    return {
      data: null,
      error: new Error("잘못된 로컬 날짜 범위입니다."),
    };
  }

  const db = getDatabaseAdapter();
  const { count, error } = await db.query<{ id: number }[]>({
    table: "posts",
    select: "id",
    filters: [
      { column: "user_id", value: userId },
      { column: "deleted_at", operator: "is", value: null },
      { column: "created_at", operator: "gte", value: localDayContext.dayStartAt },
      { column: "created_at", operator: "lte", value: localDayContext.dayEndAt },
    ],
    count: "exact",
    head: true,
  });

  if (error) {
    return { data: null, error };
  }

  return { data: (count ?? 0) > 0, error: null };
}

export async function getUserPostOnLocalDay({
  userId,
  ...localDayContext
}: LocalDayQueryOptions): Promise<{ data: Post | null; error: Error | null }> {
  if (!isValidLocalDayContext(localDayContext)) {
    return {
      data: null,
      error: new Error("잘못된 로컬 날짜 범위입니다."),
    };
  }

  const db = getDatabaseAdapter();
  const { data, error } = await db.query<PostQueryResult[]>({
    table: "posts",
    select: `*, author:users!posts_user_id_fkey!inner(*), tags:posttags(tags(*))`,
    filters: [
      { column: "user_id", value: userId },
      { column: "deleted_at", operator: "is", value: null },
      { column: "author.deleted_at", operator: "is", value: null },
      { column: "created_at", operator: "gte", value: localDayContext.dayStartAt },
      { column: "created_at", operator: "lte", value: localDayContext.dayEndAt },
    ],
    orderBy: { column: "created_at", ascending: false },
    range: { from: 0, to: 0 },
  });

  if (error) {
    return { data: null, error };
  }

  return { data: mapPostRows(data)[0] ?? null, error: null };
}

export async function getTodayPostsByLocalDay({
  followingIds,
  offset,
  limit,
  ...localDayContext
}: LocalDayListQueryOptions): Promise<{ data: Post[] | null; error: Error | null }> {
  if (!isValidLocalDayContext(localDayContext)) {
    return {
      data: null,
      error: new Error("잘못된 로컬 날짜 범위입니다."),
    };
  }

  const db = getDatabaseAdapter();
  const safeLimit = limit && limit > 0 ? limit : undefined;
  const safeOffset = Math.max(0, offset ?? 0);
  const { data, error } = await db.query<PostQueryResult[]>({
    table: "posts",
    select: `*, author:users!posts_user_id_fkey!inner(*), tags:posttags(tags(*))`,
    filters: [
      { column: "deleted_at", operator: "is", value: null },
      { column: "author.deleted_at", operator: "is", value: null },
      { column: "created_at", operator: "gte", value: localDayContext.dayStartAt },
      { column: "created_at", operator: "lte", value: localDayContext.dayEndAt },
    ],
    orderBy: { column: "created_at", ascending: false },
    range:
      typeof safeLimit === "number"
        ? { from: safeOffset, to: safeOffset + safeLimit - 1 }
        : undefined,
  });

  if (error) {
    return { data: null, error };
  }

  return {
    data: sortPostsForLocalDay(
      mapPostRows(data),
      new Set(followingIds ?? []),
      localDayContext.timezoneOffsetMinutes,
    ),
    error: null,
  };
}

export async function getNonTodayPostsPageByLocalDay({
  followingIds,
  offset,
  limit,
  ...localDayContext
}: LocalDayListQueryOptions): Promise<{ data: Post[] | null; error: Error | null }> {
  if (!isValidLocalDayContext(localDayContext)) {
    return {
      data: null,
      error: new Error("잘못된 로컬 날짜 범위입니다."),
    };
  }

  const db = getDatabaseAdapter();
  const safeLimit = limit && limit > 0 ? limit : undefined;
  const safeOffset = Math.max(0, offset ?? 0);
  const { data, error } = await db.query<PostQueryResult[]>({
    table: "posts",
    select: `*, author:users!posts_user_id_fkey!inner(*), tags:posttags(tags(*))`,
    filters: [
      { column: "deleted_at", operator: "is", value: null },
      { column: "author.deleted_at", operator: "is", value: null },
      { column: "created_at", operator: "lt", value: localDayContext.dayStartAt },
    ],
    orderBy: { column: "created_at", ascending: false },
    range:
      typeof safeLimit === "number"
        ? { from: safeOffset, to: safeOffset + safeLimit - 1 }
        : undefined,
  });

  if (error) {
    return { data: null, error };
  }

  return {
    data: sortPostsForLocalDay(
      mapPostRows(data),
      new Set(followingIds ?? []),
      localDayContext.timezoneOffsetMinutes,
    ),
    error: null,
  };
}

export async function getPostById(
  id: number,
): Promise<{ data: Post | null; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data, error } = await db.query<PostQueryResult>(
    {
      table: "posts",
      select: `*, author:users!posts_user_id_fkey!inner(*), tags:posttags(tags(*))`,
      filters: [
        { column: "id", value: id },
        { column: "deleted_at", operator: "is", value: null },
        { column: "author.deleted_at", operator: "is", value: null },
      ],
    },
    "single",
  );

  if (error || !data) {
    return { data: null, error };
  }

  const post = {
    ...data,
    author: data.author as Tables<"users">,
    tags:
      (data.tags as { tags: { name: string } | null }[])
        ?.map((postTag) => postTag.tags?.name)
        .filter((name): name is string => !!name) ?? [],
  };

  return { data: post, error: null };
}

export async function getReviewCommentsCount(
  postId: number,
): Promise<{ count: number | null; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { count, error } = await db.query<{ id: number }[]>({
    table: "comments",
    select: `id, author:users!comments_user_id_fkey!inner(id)`,
    filters: [
      { column: "post_id", value: postId },
      { column: "deleted_at", operator: "is", value: null },
      { column: "author.deleted_at", operator: "is", value: null },
    ],
    notFilters: [{ column: "start_line", operator: "is", value: null }],
    count: "exact",
    head: true,
  });

  return { count: count ?? null, error };
}

export async function deletePost(id: number): Promise<{ error: Error | null }> {
  const db = getDatabaseAdapter();

  return db.update(
    "posts",
    { deleted_at: new Date().toISOString() },
    [
      { column: "id", value: id },
      { column: "deleted_at", operator: "is", value: null },
    ],
  );
}

export async function updatePost(
  id: number,
  data: Partial<CreatePostDTO>,
): Promise<{ data: Post | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  const { tags, ...postFields } = data;
  const postData: Database["public"]["Functions"]["update_post_with_tags"]["Args"]["post_data"] =
    {
      content: postFields.content,
      code: postFields.code,
      language: postFields.language,
      is_review_enabled: postFields.is_review_enabled,
    };

  const { error } = await db.rpc<unknown>("update_post_with_tags", {
    p_post_id: id,
    post_data: postData,
    tags: tags ?? [],
  });

  if (error) {
    return { data: null, error };
  }

  return getPostById(id);
}
