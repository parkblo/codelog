import { createClient } from "@/utils/supabase/server";
import { IBookmarkService } from "./bookmark.interface";

export class BookmarkService implements IBookmarkService {
  async createBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { error } = await supabase.from("bookmarks").insert({
      post_id: postId,
      user_id: userId,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }
  async deleteBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }
  async getBookmarks(
    userId: string
  ): Promise<{ data: number[] | null; error: string | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", userId);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data.map((bookmark) => bookmark.post_id), error: null };
  }
}
