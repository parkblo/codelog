"use server";

import { CommentService } from "@/services/comment/comment.service";
import { CreateCommentDTO } from "@/services/comment/comment.interface";

async function createCommentAction(data: CreateCommentDTO) {
  const commentService = new CommentService();

  const { data: createdComment, error: createCommentError } =
    await commentService.createComment(data);

  if (createCommentError || !createdComment) {
    return {
      error: createCommentError?.message || "댓글 작성에 실패했습니다.",
    };
  }

  return { data: createdComment, error: null };
}

async function getCommentsByPostIdAction(postId: number) {
  const commentService = new CommentService();

  const { data, error } = await commentService.getCommentsByPostId(postId);

  if (error) {
    return {
      error: error?.message || "댓글 불러오기에 실패했습니다.",
    };
  }

  return { data, error: null };
}

export { createCommentAction, getCommentsByPostIdAction };
