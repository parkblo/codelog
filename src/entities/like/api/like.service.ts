import { getDatabaseAdapter } from "@/shared/lib/database";

async function isPostAvailable(
  postId: number,
): Promise<{ data: boolean; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data, error } = await db.query<{ id: number }>(
    {
      table: "posts",
      select: `id, author:users!posts_user_id_fkey!inner(id)`,
      filters: [
        { column: "id", value: postId },
        { column: "deleted_at", operator: "is", value: null },
        { column: "author.deleted_at", operator: "is", value: null },
      ],
    },
    "maybeSingle",
  );

  if (error) {
    return { data: false, error };
  }

  return { data: !!data, error: null };
}

async function isCommentAvailable(
  commentId: number,
): Promise<{ data: boolean; error: Error | null }> {
  const db = getDatabaseAdapter();

  const { data: comment, error: commentError } = await db.query<{ post_id: number }>(
    {
      table: "comments",
      select: `id, post_id, author:users!comments_user_id_fkey!inner(id)`,
      filters: [
        { column: "id", value: commentId },
        { column: "deleted_at", operator: "is", value: null },
        { column: "author.deleted_at", operator: "is", value: null },
      ],
    },
    "maybeSingle",
  );

  if (commentError) {
    return { data: false, error: commentError };
  }

  if (!comment) {
    return { data: false, error: null };
  }

  return isPostAvailable(comment.post_id);
}

export async function createPostLike(
  postId: number,
  userId: string,
): Promise<{ error: Error | null }> {
  const { data: postAvailable, error: postError } = await isPostAvailable(postId);

  if (postError) {
    return { error: postError };
  }

  if (!postAvailable) {
    return { error: new Error("포스트를 찾을 수 없습니다.") };
  }

  const db = getDatabaseAdapter();
  return db.insert("post_likes", {
    post_id: postId,
    user_id: userId,
  });
}

export async function deletePostLike(
  postId: number,
  userId: string,
): Promise<{ error: Error | null }> {
  const { data: postAvailable, error: postError } = await isPostAvailable(postId);

  if (postError) {
    return { error: postError };
  }

  if (!postAvailable) {
    return { error: new Error("포스트를 찾을 수 없습니다.") };
  }

  const db = getDatabaseAdapter();
  return db.remove("post_likes", [
    { column: "post_id", value: postId },
    { column: "user_id", value: userId },
  ]);
}

export async function createCommentLike(
  commentId: number,
  userId: string,
): Promise<{ error: Error | null }> {
  const { data: commentAvailable, error: commentError } =
    await isCommentAvailable(commentId);

  if (commentError) {
    return { error: commentError };
  }

  if (!commentAvailable) {
    return { error: new Error("댓글을 찾을 수 없습니다.") };
  }

  const db = getDatabaseAdapter();
  return db.insert("comment_likes", {
    comment_id: commentId,
    user_id: userId,
  });
}

export async function deleteCommentLike(
  commentId: number,
  userId: string,
): Promise<{ error: Error | null }> {
  const { data: commentAvailable, error: commentError } =
    await isCommentAvailable(commentId);

  if (commentError) {
    return { error: commentError };
  }

  if (!commentAvailable) {
    return { error: new Error("댓글을 찾을 수 없습니다.") };
  }

  const db = getDatabaseAdapter();
  return db.remove("comment_likes", [
    { column: "comment_id", value: commentId },
    { column: "user_id", value: userId },
  ]);
}

export async function getPostLikes(
  userId: string,
): Promise<{ data: number[] | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  const { data, error } = await db.query<{ post_id: number }[]>({
    table: "post_likes",
    select: "post_id",
    filters: [{ column: "user_id", value: userId }],
  });

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((like) => like.post_id),
    error: null,
  };
}
