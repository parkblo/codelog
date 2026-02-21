import { getDatabaseAdapter } from "@/shared/lib/database";
import { Database, Tables } from "@/shared/types/database.types";
import { Post } from "@/shared/types/types";

import { CreatePostDTO } from "./post.interface";

type PostQueryResult = Tables<"posts"> & {
  author: Tables<"users">;
  tags: { tags: { name: string } | null }[] | null;
};

export async function createPost(
  data: CreatePostDTO,
): Promise<{ data: Post | null; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data: insertedPost, error } = await db.rpc<Tables<"posts">>(
    "create_post_with_tags",
    {
      post_data: {
        content: data.content,
        code: data.code,
        language: data.language,
        user_id: data.author.id,
        is_review_enabled: data.is_review_enabled,
      } as unknown as Database["public"]["Functions"]["create_post_with_tags"]["Args"]["post_data"],
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
  const escapedKeyword = keyword ? keyword.replace(/[%_]/g, "\\$&") : null;

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

  const posts = (data ?? []).map((post) => ({
    ...post,
    tags:
      post.tags
        ?.map((postTag) => postTag.tags?.name)
        .filter((name): name is string => !!name) ?? [],
  }));

  return { data: posts, error: null };
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

  const { error } = await db.rpc<unknown>("update_post_with_tags", {
    p_post_id: id,
    post_data: {
      content: postFields.content,
      code: postFields.code,
      language: postFields.language,
      is_review_enabled: postFields.is_review_enabled,
    } as unknown as Database["public"]["Functions"]["update_post_with_tags"]["Args"]["post_data"],
    tags: tags ?? [],
  });

  if (error) {
    return { data: null, error };
  }

  return getPostById(id);
}
