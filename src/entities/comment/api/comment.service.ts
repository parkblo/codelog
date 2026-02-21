import { getDatabaseAdapter } from "@/shared/lib/database";
import { Comment } from "@/shared/types/types";

import {
  CommentListOptions,
  CreateCommentDTO,
} from "./comment.interface";

export async function isPostAvailable(
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

export async function createComment(
  data: CreateCommentDTO,
): Promise<{ data: Comment | null; error: Error | null }> {
  const { data: postAvailable, error: postError } = await isPostAvailable(data.postId);

  if (postError) {
    return { data: null, error: postError };
  }

  if (!postAvailable) {
    return { data: null, error: new Error("포스트를 찾을 수 없습니다.") };
  }

  const db = getDatabaseAdapter();
  return db.insert<Comment>(
    "comments",
    {
      content: data.content,
      post_id: data.postId,
      user_id: data.userId,
      start_line: data.startLine,
      end_line: data.endLine,
    },
    {
      select: `
        *, author:users!comments_user_id_fkey(id, username, nickname, avatar, bio)
      `,
      mode: "single",
    },
  );
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

export async function getCommentLikesByUser(
  userId: string,
): Promise<{ data: number[] | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  const { data, error } = await db.query<{ comment_id: number }[]>({
    table: "comment_likes",
    select: "comment_id",
    filters: [{ column: "user_id", value: userId }],
  });

  if (error) {
    return { data: null, error };
  }

  return { data: (data ?? []).map((like) => like.comment_id), error: null };
}

export async function getCommentsByPostId(
  postId: number,
  { offset, limit, type = "all" }: CommentListOptions = {},
): Promise<{ data: Comment[] | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  const safeLimit = limit && limit > 0 ? limit : undefined;
  const safeOffset = Math.max(0, offset ?? 0);

  const { data, error } = await db.query<Comment[]>({
    table: "comments",
    select: `*, author:users!comments_user_id_fkey!inner(id, username, nickname, avatar, bio)`,
    filters: [
      { column: "post_id", value: postId },
      { column: "deleted_at", operator: "is", value: null },
      { column: "author.deleted_at", operator: "is", value: null },
    ],
    or: type === "general" ? "start_line.is.null,end_line.is.null" : undefined,
    notFilters:
      type === "review"
        ? [
            { column: "start_line", operator: "is", value: null },
            { column: "end_line", operator: "is", value: null },
          ]
        : undefined,
    orderBy: { column: "created_at", ascending: true },
    range:
      typeof safeLimit === "number"
        ? { from: safeOffset, to: safeOffset + safeLimit - 1 }
        : undefined,
  });

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? [], error: null };
}

export async function getCommentById(
  commentId: number,
): Promise<{ data: Comment | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  return db.query<Comment>(
    {
      table: "comments",
      select: `*, author:users!comments_user_id_fkey!inner(id, username, nickname, avatar, bio)`,
      filters: [
        { column: "id", value: commentId },
        { column: "deleted_at", operator: "is", value: null },
        { column: "author.deleted_at", operator: "is", value: null },
      ],
    },
    "single",
  );
}

export async function updateComment(
  id: number,
  data: Partial<CreateCommentDTO>,
): Promise<{ data: Comment | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  const { error: updateError } = await db.update(
    "comments",
    { content: data.content },
    [
      { column: "id", value: id },
      { column: "deleted_at", operator: "is", value: null },
    ],
  );

  if (updateError) {
    return { data: null, error: updateError };
  }

  return getCommentById(id);
}

export async function deleteComment(
  id: number,
): Promise<{ error: Error | null }> {
  const db = getDatabaseAdapter();
  return db.update(
    "comments",
    { deleted_at: new Date().toISOString() },
    [
      { column: "id", value: id },
      { column: "deleted_at", operator: "is", value: null },
    ],
  );
}
