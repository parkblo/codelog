import { createClient } from "@/shared/lib/utils/supabase/server";
import { ICommentService, CreateCommentDTO } from "./comment.interface";
import { Comment } from "@/shared/types/types";

export class CommentService implements ICommentService {
  async createComment(
    data: CreateCommentDTO
  ): Promise<{ data: Comment | null; error: Error | null }> {
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
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .not("start_line", "is", null);

    return { count, error };
  }

  async getCommentsByPostId(
    postId: number
  ): Promise<{ data: Comment[] | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("comments")
      .select(
        `*, author:users!comments_user_id_fkey(id, username, nickname, avatar, bio)`
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

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
        `*, author:users!comments_user_id_fkey(id, username, nickname, avatar, bio)`
      )
      .eq("id", commentId)
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
      .select(
        `*, author:users!comments_user_id_fkey(id, username, nickname, avatar, bio)`
      )
      .single();

    if (updateCommentError) {
      return { data: null, error: updateCommentError };
    }

    return { data: updatedComment, error: null };
  }

  async deleteComment(id: number): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase.from("comments").delete().eq("id", id);

    return { error };
  }
}
