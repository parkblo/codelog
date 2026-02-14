import { createClient } from "@/shared/lib/supabase/server";
import { Comment } from "@/shared/types/types";

import {
  CommentListOptions,
  CreateCommentDTO,
  ICommentService,
} from "./comment.interface";

export class CommentService implements ICommentService {
  async isPostAvailable(
    postId: number
  ): Promise<{ data: boolean; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select(`id, author:users!posts_user_id_fkey!inner(id)`)
      .eq("id", postId)
      .is("deleted_at", null)
      .is("author.deleted_at", null)
      .maybeSingle();

    if (error) {
      return { data: false, error };
    }

    return { data: !!data, error: null };
  }

  async createComment(
    data: CreateCommentDTO
  ): Promise<{ data: Comment | null; error: Error | null }> {
    const { data: isPostAvailable, error: postError } = await this.isPostAvailable(
      data.postId
    );

    if (postError) {
      return { data: null, error: postError };
    }

    if (!isPostAvailable) {
      return { data: null, error: new Error("포스트를 찾을 수 없습니다.") };
    }

    const supabase = await createClient();

    const { data: createdComment, error: createCommentError } = await supabase
      .from("comments")
      .insert({
        content: data.content,
        post_id: data.postId,
        user_id: data.userId,
        start_line: data.startLine,
        end_line: data.endLine,
      })
      .select(
        `
        *, author:users!comments_user_id_fkey(id, username, nickname, avatar, bio)`
      )
      .single();

    return { data: createdComment, error: createCommentError };
  }

  async getReviewCommentsCount(
    postId: number
  ): Promise<{ count: number | null; error: Error | null }> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("comments")
      .select(`id, author:users!comments_user_id_fkey!inner(id)`, {
        count: "exact",
        head: true,
      })
      .eq("post_id", postId)
      .is("deleted_at", null)
      .is("author.deleted_at", null)
      .not("start_line", "is", null);

    return { count, error };
  }

  async getCommentLikesByUser(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", userId);

    if (error) {
      return { data: null, error };
    }

    return { data: data.map((like) => like.comment_id), error: null };
  }

  async getCommentsByPostId(
    postId: number,
    { offset, limit, type = "all" }: CommentListOptions = {},
  ): Promise<{ data: Comment[] | null; error: Error | null }> {
    const supabase = await createClient();

    let query = supabase
      .from("comments")
      .select(
        `*, author:users!comments_user_id_fkey!inner(id, username, nickname, avatar, bio)`,
      )
      .eq("post_id", postId)
      .is("deleted_at", null)
      .is("author.deleted_at", null)
      .order("created_at", { ascending: true });

    if (type === "general") {
      query = query.or("start_line.is.null,end_line.is.null");
    }

    if (type === "review") {
      query = query.not("start_line", "is", null).not("end_line", "is", null);
    }

    if (limit && limit > 0) {
      const safeOffset = Math.max(0, offset ?? 0);
      query = query.range(safeOffset, safeOffset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  async getCommentById(
    commentId: number
  ): Promise<{ data: Comment | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("comments")
      .select(
        `*, author:users!comments_user_id_fkey!inner(id, username, nickname, avatar, bio)`
      )
      .eq("id", commentId)
      .is("deleted_at", null)
      .is("author.deleted_at", null)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  async updateComment(
    id: number,
    data: Partial<CreateCommentDTO>
  ): Promise<{ data: Comment | null; error: Error | null }> {
    const supabase = await createClient();

    const { data: updatedComment, error: updateCommentError } = await supabase
      .from("comments")
      .update({ content: data.content })
      .eq("id", id)
      .is("deleted_at", null)
      .select(
        `*, author:users!comments_user_id_fkey!inner(id, username, nickname, avatar, bio)`
      )
      .is("author.deleted_at", null)
      .single();

    if (updateCommentError) {
      return { data: null, error: updateCommentError };
    }

    return { data: updatedComment, error: null };
  }

  async deleteComment(id: number): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    return { error };
  }
}
