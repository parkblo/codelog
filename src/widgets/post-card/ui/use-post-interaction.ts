"use client";

import { useEffect, useReducer } from "react";

import {
  createBookmarkAction,
  deleteBookmarkAction,
} from "@/entities/bookmark";
import { createPostLikeAction, deletePostLikeAction } from "@/entities/like";
import { useAuth } from "@/entities/user";
import { handleAction } from "@/shared/lib";
import { captureEvent } from "@/shared/lib/posthog";

interface UsePostInteractionProps {
  postId: number;
  initialIsLiked?: boolean;
  initialIsBookmarked?: boolean;
  initialLikeCount?: number;
  initialBookmarkCount?: number;
}

type InteractionState = {
  isBookmarked: boolean;
  isLiked: boolean;
  bookmarkCount: number;
  likeCount: number;
};

type InteractionAction =
  | { type: "replace"; nextState: InteractionState }
  | { type: "sync"; nextState: InteractionState };

function interactionReducer(
  _state: InteractionState,
  action: InteractionAction,
) {
  return action.nextState;
}

export function usePostInteraction({
  postId,
  initialIsLiked = false,
  initialIsBookmarked = false,
  initialLikeCount = 0,
  initialBookmarkCount = 0,
}: UsePostInteractionProps) {
  const { user, openAuthModal } = useAuth();
  const [interactionState, dispatch] = useReducer(interactionReducer, {
    isBookmarked: initialIsBookmarked,
    isLiked: initialIsLiked,
    bookmarkCount: initialBookmarkCount,
    likeCount: initialLikeCount,
  });
  const {
    isLiked: likedState,
    isBookmarked: bookmarkedState,
    likeCount,
    bookmarkCount,
  } = interactionState;
  const isLiked = user ? likedState : false;
  const isBookmarked = user ? bookmarkedState : false;

  useEffect(() => {
    dispatch({
      type: "sync",
      nextState: {
        isBookmarked: initialIsBookmarked,
        isLiked: initialIsLiked,
        bookmarkCount: initialBookmarkCount,
        likeCount: initialLikeCount,
      },
    });
  }, [
    postId,
    initialIsBookmarked,
    initialIsLiked,
    initialBookmarkCount,
    initialLikeCount,
  ]);

  const handleLikeClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_like" });
      openAuthModal("login");
      return;
    }

    const willLike = !likedState;
    const previousState = interactionState;
    const nextState = {
      isLiked: willLike,
      isBookmarked: bookmarkedState,
      likeCount: willLike ? likeCount + 1 : Math.max(0, likeCount - 1),
      bookmarkCount,
    };

    const action = willLike
      ? createPostLikeAction(postId)
      : deletePostLikeAction(postId);

    dispatch({ type: "replace", nextState });
    await handleAction(action, {
      actionName: willLike ? "create_post_like" : "delete_post_like",
      onError: () => {
        dispatch({ type: "replace", nextState: previousState });
      },
    });
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_bookmark" });
      openAuthModal("login");
      return;
    }

    const willBookmark = !bookmarkedState;
    const previousState = interactionState;
    const nextState = {
      isBookmarked: willBookmark,
      isLiked: likedState,
      bookmarkCount: willBookmark
        ? bookmarkCount + 1
        : Math.max(0, bookmarkCount - 1),
      likeCount,
    };

    const action = willBookmark
      ? createBookmarkAction(postId)
      : deleteBookmarkAction(postId);

    dispatch({ type: "replace", nextState });
    await handleAction(action, {
      actionName: willBookmark ? "create_bookmark" : "delete_bookmark",
      onError: () => {
        dispatch({ type: "replace", nextState: previousState });
      },
    });
  };

  return {
    isLiked,
    isBookmarked,
    likeCount,
    bookmarkCount,
    handleLikeClick,
    handleBookmarkClick,
  };
}
