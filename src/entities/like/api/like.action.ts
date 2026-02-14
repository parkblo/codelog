"use server";

import { revalidatePath } from "next/cache";

import { LikeService } from "@/entities/like/api/like.service";
import { getCurrentUserAuth } from "@/shared/lib/supabase/current-user";

async function createPostLikeAction(postId: number) {
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.createPostLike(postId, user.id);

  if (error) {
    console.error(error);
    return { error: error.message || "좋아요에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function deletePostLikeAction(postId: number) {
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.deletePostLike(postId, user.id);

  if (error) {
    console.error(error);
    return { error: error.message || "좋아요 취소에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function createCommentLikeAction(postId: number, commentId: number) {
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.createCommentLike(commentId, user.id);

  if (error) {
    console.error(error);
    return { error: error.message || "좋아요에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

async function deleteCommentLikeAction(postId: number, commentId: number) {
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const likeService = new LikeService();
  const { error } = await likeService.deleteCommentLike(commentId, user.id);

  if (error) {
    console.error(error);
    return { error: error.message || "좋아요 취소에 실패했습니다." };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

export {
  createCommentLikeAction,
  createPostLikeAction,
  deleteCommentLikeAction,
  deletePostLikeAction,
};
