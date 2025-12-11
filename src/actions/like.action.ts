"use server";

import { ServerAuthService } from "@/services/auth/server-auth.service";
import { LikeService } from "@/services/like/like.service";
import { revalidatePath } from "next/cache";

async function createPostLikeAction(postId: number) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.createPostLike(postId, user.id);

  if (error) {
    return { error: error?.message || "좋아요에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function deletePostLikeAction(postId: number) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.deletePostLike(postId, user.id);

  if (error) {
    return { error: error?.message || "좋아요 취소에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function createCommentLikeAction(postId: number, commentId: number) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.createCommentLike(commentId, user.id);

  if (error) {
    return { error: error?.message || "좋아요에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function deleteCommentLikeAction(postId: number, commentId: number) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.deleteCommentLike(commentId, user.id);

  if (error) {
    return { error: error?.message || "좋아요 취소에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

export {
  createPostLikeAction,
  deletePostLikeAction,
  createCommentLikeAction,
  deleteCommentLikeAction,
};
