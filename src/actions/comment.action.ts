"use server";

import { CommentService } from "@/services/comment/comment.service";
import { CreateCommentDTO } from "@/services/comment/comment.interface";
import { revalidatePath } from "next/cache";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import { LikeService } from "@/services/like/like.service";

async function createCommentAction(data: CreateCommentDTO) {
  const commentService = new CommentService();

  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // userId를 신뢰할 수 있는 서버 세션 정보로 덮어씁니다.
  const secureData = { ...data, userId: user.id };

  const { data: createdComment, error: createCommentError } =
    await commentService.createComment(secureData);

  if (createCommentError || !createdComment) {
    return {
      error: createCommentError?.message || "댓글 작성에 실패했습니다.",
    };
  }

  revalidatePath(`/post/${data.postId}`);

  return { data: createdComment, error: null };
}

async function getCommentsByPostIdAction(postId: number) {
  const commentService = new CommentService();
  const authService = new ServerAuthService();
  const likeService = new LikeService();
  const user = await authService.getCurrentUser();

  const { data: comments, error: getCommentsError } =
    await commentService.getCommentsByPostId(postId);

  if (getCommentsError) {
    return {
      error: getCommentsError?.message || "댓글 불러오기에 실패했습니다.",
    };
  }

  if (!user) {
    return {
      data: comments?.map((comment) => ({
        ...comment,
        is_liked: false,
      })),
      error: null,
    };
  }

  const { data: commentLikes, error: getCommentLikesError } =
    await likeService.getCommentLikes(user.id);

  if (getCommentLikesError) {
    return {
      error:
        getCommentLikesError?.message ||
        "댓글 좋아요 정보 불러오기에 실패했습니다.",
    };
  }

  const data = comments?.map((comment) => ({
    ...comment,
    is_liked: commentLikes?.includes(comment.id),
  }));

  return { data, error: null };
}

async function updateCommentAction(
  commentId: number,
  postId: number,
  data: Partial<CreateCommentDTO>
) {
  const commentService = new CommentService();

  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 소유권 확인
  const { data: originalComment, error: fetchError } =
    await commentService.getCommentById(commentId);

  if (fetchError || !originalComment) {
    return { error: "댓글을 찾을 수 없습니다." };
  }

  if (originalComment.author.id !== user.id) {
    return { error: "본인의 댓글만 수정할 수 있습니다." };
  }

  const { data: updatedComment, error: updateCommentError } =
    await commentService.updateComment(commentId, data);

  if (updateCommentError || !updatedComment) {
    return {
      error: updateCommentError?.message || "댓글 수정에 실패했습니다.",
    };
  }

  revalidatePath(`/post/${postId}`);

  return { data: updatedComment, error: null };
}

async function deleteCommentAction(commentId: number, postId: number) {
  const commentService = new CommentService();

  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 소유권 확인
  const { data: originalComment, error: fetchError } =
    await commentService.getCommentById(commentId);

  if (fetchError || !originalComment) {
    return { error: "댓글을 찾을 수 없습니다." };
  }

  if (originalComment.author.id !== user.id) {
    return { error: "본인의 댓글만 삭제할 수 있습니다." };
  }

  const { error } = await commentService.deleteComment(commentId);

  revalidatePath(`/post/${postId}`);

  return { error };
}

export {
  createCommentAction,
  getCommentsByPostIdAction,
  updateCommentAction,
  deleteCommentAction,
};
