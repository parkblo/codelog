"use server";

import { ServerAuthService } from "@/services/auth/server-auth.service";
import { BookmarkService } from "@/services/bookmark/bookmark.service";
import { revalidatePath } from "next/cache";

async function createBookmarkAction(postId: number) {
  const bookmarkService = new BookmarkService();
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await bookmarkService.createBookmark(postId, user.id);

  if (error) {
    return { error };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function deleteBookmarkAction(postId: number) {
  const bookmarkService = new BookmarkService();
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await bookmarkService.deleteBookmark(postId, user.id);

  if (error) {
    return { error };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function getBookmarksAction() {
  const bookmarkService = new BookmarkService();
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data, error } = await bookmarkService.getBookmarks(user.id);

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export { createBookmarkAction, deleteBookmarkAction, getBookmarksAction };
