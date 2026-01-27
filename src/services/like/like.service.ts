import { ILikeService } from "./like.interface";
import { createClient } from "@/shared/lib/utils/supabase/server";

export class LikeService implements ILikeService {
  async createPostLike(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: userId,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  }
  async deletePostLike(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }
  async createCommentLike(
    commentId: number,
    userId: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase.from("comment_likes").insert({
      comment_id: commentId,
      user_id: userId,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  }
  async deleteCommentLike(
    commentId: number,
    userId: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }

  async getPostLikes(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId);

    if (error) {
      return { data: null, error };
    }

    return { data: data.map((like) => like.post_id), error: null };
  }

  async getCommentLikes(
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
}
