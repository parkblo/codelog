"use server";

import { revalidatePath } from "next/cache";

// eslint-disable-next-line boundaries/element-types
import { CommentService } from "@/entities/comment/api/comment.service";
import { LikeService } from "@/entities/like/api/like.service";
// eslint-disable-next-line boundaries/element-types
import { PostService } from "@/entities/post/api/post.service";
// eslint-disable-next-line boundaries/element-types
import { ServerAuthService } from "@/entities/user/api/server-auth.service";

async function createPostLikeAction(postId: number) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const postService = new PostService();
  const { data: post, error: postError } = await postService.getPostById(postId);

  if (postError || !post) {
    return { error: "포스트를 찾을 수 없습니다." };
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
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const postService = new PostService();
  const { data: post, error: postError } = await postService.getPostById(postId);

  if (postError || !post) {
    return { error: "포스트를 찾을 수 없습니다." };
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
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const postService = new PostService();
  const commentService = new CommentService();
  const [{ data: post, error: postError }, { data: comment, error: commentError }] =
    await Promise.all([
      postService.getPostById(postId),
      commentService.getCommentById(commentId),
    ]);

  if (postError || !post) {
    return { error: "포스트를 찾을 수 없습니다." };
  }

  if (commentError || !comment || comment.post_id !== postId) {
    return { error: "댓글을 찾을 수 없습니다." };
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
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const postService = new PostService();
  const commentService = new CommentService();
  const [{ data: post, error: postError }, { data: comment, error: commentError }] =
    await Promise.all([
      postService.getPostById(postId),
      commentService.getCommentById(commentId),
    ]);

  if (postError || !post) {
    return { error: "포스트를 찾을 수 없습니다." };
  }

  if (commentError || !comment || comment.post_id !== postId) {
    return { error: "댓글을 찾을 수 없습니다." };
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
