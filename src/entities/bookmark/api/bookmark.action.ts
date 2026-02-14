"use server";

import { revalidatePath } from "next/cache";

import { BookmarkService } from "@/entities/bookmark/api/bookmark.service";
// eslint-disable-next-line boundaries/element-types
import { PostService } from "@/entities/post/api/post.service";
// eslint-disable-next-line boundaries/element-types
import { ServerAuthService } from "@/entities/user/api/server-auth.service";

async function createBookmarkAction(postId: number) {
  const bookmarkService = new BookmarkService();
  const postService = new PostService();
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: post, error: postError } = await postService.getPostById(postId);

  if (postError || !post) {
    return { error: "포스트를 찾을 수 없습니다." };
  }

  const { error } = await bookmarkService.createBookmark(postId, user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function deleteBookmarkAction(postId: number) {
  const bookmarkService = new BookmarkService();
  const postService = new PostService();
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: post, error: postError } = await postService.getPostById(postId);

  if (postError || !post) {
    return { error: "포스트를 찾을 수 없습니다." };
  }

  const { error } = await bookmarkService.deleteBookmark(postId, user.id);

  if (error) {
    console.error(error);
    return { error: error.message };
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
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export { createBookmarkAction, deleteBookmarkAction, getBookmarksAction };
