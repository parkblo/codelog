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

export async function createBookmark(
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
  return db.insert("bookmarks", {
    post_id: postId,
    user_id: userId,
  });
}

export async function deleteBookmark(
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
  return db.remove("bookmarks", [
    { column: "post_id", value: postId },
    { column: "user_id", value: userId },
  ]);
}

export async function getBookmarks(
  userId: string,
): Promise<{ data: number[] | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  const { data, error } = await db.query<{ post_id: number }[]>({
    table: "bookmarks",
    select: "post_id",
    filters: [{ column: "user_id", value: userId }],
  });

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((bookmark) => bookmark.post_id),
    error: null,
  };
}
