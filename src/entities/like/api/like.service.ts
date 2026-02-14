import { createClient } from "@/shared/lib/supabase/server";

import { ILikeService } from "./like.interface";

export class LikeService implements ILikeService {
  private async isPostAvailable(
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

  private async isCommentAvailable(
    commentId: number
  ): Promise<{ data: boolean; error: Error | null }> {
    const supabase = await createClient();

    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select(`id, post_id, author:users!comments_user_id_fkey!inner(id)`)
      .eq("id", commentId)
      .is("deleted_at", null)
      .is("author.deleted_at", null)
      .maybeSingle();

    if (commentError) {
      return { data: false, error: commentError };
    }

    if (!comment) {
      return { data: false, error: null };
    }

    const { data: isPostAvailable, error: postError } = await this.isPostAvailable(
      comment.post_id
    );

    if (postError) {
      return { data: false, error: postError };
    }

    return { data: isPostAvailable, error: null };
  }

  async createPostLike(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }> {
    const { data: isPostAvailable, error: postError } = await this.isPostAvailable(
      postId
    );

    if (postError) {
      return { error: postError };
    }

    if (!isPostAvailable) {
      return { error: new Error("포스트를 찾을 수 없습니다.") };
    }

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
    const { data: isPostAvailable, error: postError } = await this.isPostAvailable(
      postId
    );

    if (postError) {
      return { error: postError };
    }

    if (!isPostAvailable) {
      return { error: new Error("포스트를 찾을 수 없습니다.") };
    }

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
    const { data: isCommentAvailable, error: commentError } =
      await this.isCommentAvailable(commentId);

    if (commentError) {
      return { error: commentError };
    }

    if (!isCommentAvailable) {
      return { error: new Error("댓글을 찾을 수 없습니다.") };
    }

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
    const { data: isCommentAvailable, error: commentError } =
      await this.isCommentAvailable(commentId);

    if (commentError) {
      return { error: commentError };
    }

    if (!isCommentAvailable) {
      return { error: new Error("댓글을 찾을 수 없습니다.") };
    }

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
