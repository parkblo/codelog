"use server";

import { revalidatePath } from "next/cache";

import {
  createBookmark,
  deleteBookmark,
  getBookmarks,
} from "@/entities/bookmark/api/bookmark.service";
import { getCurrentUserAuth } from "@/shared/lib/supabase/current-user";

async function createBookmarkAction(postId: number) {
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await createBookmark(postId, user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function deleteBookmarkAction(postId: number) {
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await deleteBookmark(postId, user.id);

  if (error) {
    console.error(error);
    return { error: error.message };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function getBookmarksAction() {
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data, error } = await getBookmarks(user.id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export { createBookmarkAction, deleteBookmarkAction, getBookmarksAction };
