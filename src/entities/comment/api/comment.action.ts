"use server";

import { revalidatePath } from "next/cache";

import {
  CommentListOptions,
  CreateCommentDTO,
} from "@/entities/comment/api/comment.interface";
import { CommentService } from "@/entities/comment/api/comment.service";
import { getCurrentUserAuth } from "@/shared/lib/supabase/current-user";
import { Comment } from "@/shared/types";

const DEFAULT_COMMENT_PAGE_SIZE = 10;
const MAX_COMMENT_PAGE_SIZE = 50;

function getSafePageSize(limit?: number) {
  if (!limit || limit <= 0) {
    return DEFAULT_COMMENT_PAGE_SIZE;
  }

  return Math.min(limit, MAX_COMMENT_PAGE_SIZE);
}

function getSafeOffset(offset?: number) {
  if (!offset || offset < 0) {
    return 0;
  }

  return offset;
}

async function resolveCommentInteraction(comments: Comment[] | null) {
  const user = await getCurrentUserAuth();
  const commentService = new CommentService();

  if (!comments) {
    return { data: [], error: null };
  }

  if (!user) {
    return {
      data: comments.map((comment) => ({
        ...comment,
        is_liked: false,
      })),
      error: null,
    };
  }

  const { data: commentLikes, error: getCommentLikesError } =
    await commentService.getCommentLikesByUser(user.id);

  if (getCommentLikesError) {
    console.error(getCommentLikesError);
    return {
      data: null,
      error:
        getCommentLikesError.message || "댓글 좋아요 정보 불러오기에 실패했습니다.",
    };
  }

  return {
    data: comments.map((comment) => ({
      ...comment,
      is_liked: commentLikes?.includes(comment.id),
    })),
    error: null,
  };
}

async function createCommentAction(data: CreateCommentDTO) {
  const commentService = new CommentService();
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // userId를 신뢰할 수 있는 서버 세션 정보로 덮어씁니다.
  const secureData = { ...data, userId: user.id };

  const { data: createdComment, error: createCommentError } =
    await commentService.createComment(secureData);

  if (createCommentError || !createdComment) {
    console.error(createCommentError);
    return {
      error: createCommentError?.message || "댓글 작성에 실패했습니다.",
    };
  }

  revalidatePath(`/post/${data.postId}`);

  return { data: createdComment, error: null };
}

async function getCommentsByPostIdAction(
  postId: number,
  options: CommentListOptions = {},
) {
  const commentService = new CommentService();

  const { data: comments, error: getCommentsError } =
    await commentService.getCommentsByPostId(postId, options);

  if (getCommentsError) {
    console.error(getCommentsError);
    return {
      data: null,
      error: getCommentsError?.message || "댓글 불러오기에 실패했습니다.",
    };
  }

  return resolveCommentInteraction(comments);
}

async function getCommentsByPostIdPageAction(
  postId: number,
  options: CommentListOptions = {},
) {
  const safeLimit = getSafePageSize(options.limit);
  const safeOffset = getSafeOffset(options.offset);

  const { data: comments, error: getCommentsError } =
    await getCommentsByPostIdAction(postId, {
      ...options,
      offset: safeOffset,
      limit: safeLimit + 1,
    });

  if (getCommentsError) {
    return {
      data: null,
      error: getCommentsError,
      hasMore: false,
    };
  }

  const safeComments = comments ?? [];
  const hasMore = safeComments.length > safeLimit;

  return {
    data: hasMore ? safeComments.slice(0, safeLimit) : safeComments,
    error: null,
    hasMore,
  };
}

async function updateCommentAction(
  commentId: number,
  postId: number,
  data: Partial<CreateCommentDTO>,
) {
  const commentService = new CommentService();
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: isPostAvailable, error: postError } =
    await commentService.isPostAvailable(postId);

  if (postError || !isPostAvailable) {
    return { error: "포스트를 찾을 수 없습니다." };
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
    console.error(updateCommentError);
    return {
      error: updateCommentError?.message || "댓글 수정에 실패했습니다.",
    };
  }

  revalidatePath(`/post/${postId}`);

  return { data: updatedComment, error: null };
}

async function deleteCommentAction(commentId: number, postId: number) {
  const commentService = new CommentService();
  const user = await getCurrentUserAuth();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: isPostAvailable, error: postError } =
    await commentService.isPostAvailable(postId);

  if (postError || !isPostAvailable) {
    return { error: "포스트를 찾을 수 없습니다." };
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

  const { error: deleteError } = await commentService.deleteComment(commentId);
  if (deleteError) {
    console.error(deleteError);
    return { error: deleteError.message };
  }

  revalidatePath(`/post/${postId}`);

  return { error: null };
}

export {
  createCommentAction,
  deleteCommentAction,
  getCommentsByPostIdAction,
  getCommentsByPostIdPageAction,
  updateCommentAction,
};
