import { createClient } from "@/shared/lib/supabase/server";

import { IBookmarkService } from "./bookmark.interface";

export class BookmarkService implements IBookmarkService {
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

  async createBookmark(
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

    const { error } = await supabase.from("bookmarks").insert({
      post_id: postId,
      user_id: userId,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  }
  async deleteBookmark(
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
      .from("bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }
  async getBookmarks(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", userId);

    if (error) {
      return { data: null, error };
    }

    return { data: data.map((bookmark) => bookmark.post_id), error: null };
  }
}
