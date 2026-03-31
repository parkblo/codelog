"use client";

import { useEffect, useReducer, useRef } from "react";

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
  | { type: "sync"; nextState: InteractionState }
  | { type: "toggle_like" }
  | { type: "toggle_bookmark" }
  | {
      type: "rollback_like";
      previousState: Pick<InteractionState, "isLiked" | "likeCount">;
    }
  | {
      type: "rollback_bookmark";
      previousState: Pick<InteractionState, "isBookmarked" | "bookmarkCount">;
    };

function createInteractionState({
  initialIsLiked,
  initialIsBookmarked,
  initialLikeCount,
  initialBookmarkCount,
}: {
  initialIsLiked: boolean;
  initialIsBookmarked: boolean;
  initialLikeCount: number;
  initialBookmarkCount: number;
}): InteractionState {
  return {
    isBookmarked: initialIsBookmarked,
    isLiked: initialIsLiked,
    bookmarkCount: initialBookmarkCount,
    likeCount: initialLikeCount,
  };
}

function interactionReducer(
  state: InteractionState,
  action: InteractionAction,
): InteractionState {
  switch (action.type) {
    case "sync":
      return action.nextState;
    case "toggle_like": {
      const willLike = !state.isLiked;

      return {
        ...state,
        isLiked: willLike,
        likeCount: willLike ? state.likeCount + 1 : Math.max(0, state.likeCount - 1),
      };
    }
    case "toggle_bookmark": {
      const willBookmark = !state.isBookmarked;

      return {
        ...state,
        isBookmarked: willBookmark,
        bookmarkCount: willBookmark
          ? state.bookmarkCount + 1
          : Math.max(0, state.bookmarkCount - 1),
      };
    }
    case "rollback_like":
      return {
        ...state,
        isLiked: action.previousState.isLiked,
        likeCount: action.previousState.likeCount,
      };
    case "rollback_bookmark":
      return {
        ...state,
        isBookmarked: action.previousState.isBookmarked,
        bookmarkCount: action.previousState.bookmarkCount,
      };
  }
}

export function usePostInteraction({
  postId,
  initialIsLiked = false,
  initialIsBookmarked = false,
  initialLikeCount = 0,
  initialBookmarkCount = 0,
}: UsePostInteractionProps) {
  const { user, openAuthModal } = useAuth();
  const [interactionState, dispatch] = useReducer(
    interactionReducer,
    createInteractionState({
      initialIsBookmarked,
      initialIsLiked,
      initialBookmarkCount,
      initialLikeCount,
    }),
  );
  const likeRequestIdRef = useRef(0);
  const bookmarkRequestIdRef = useRef(0);
  const {
    isLiked: likedState,
    isBookmarked: bookmarkedState,
    likeCount,
    bookmarkCount,
  } = interactionState;
  const isLiked = user ? likedState : false;
  const isBookmarked = user ? bookmarkedState : false;

  useEffect(() => {
    likeRequestIdRef.current += 1;
    bookmarkRequestIdRef.current += 1;
    dispatch({
      type: "sync",
      nextState: createInteractionState({
        initialIsBookmarked,
        initialIsLiked,
        initialBookmarkCount,
        initialLikeCount,
      }),
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

    const previousState = interactionState;
    const willLike = !previousState.isLiked;
    const requestId = likeRequestIdRef.current + 1;
    likeRequestIdRef.current = requestId;

    const action = willLike
      ? createPostLikeAction(postId)
      : deletePostLikeAction(postId);

    dispatch({ type: "toggle_like" });
    await handleAction(action, {
      actionName: willLike ? "create_post_like" : "delete_post_like",
      onError: () => {
        if (likeRequestIdRef.current !== requestId) {
          return;
        }

        dispatch({
          type: "rollback_like",
          previousState: {
            isLiked: previousState.isLiked,
            likeCount: previousState.likeCount,
          },
        });
      },
    });
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_bookmark" });
      openAuthModal("login");
      return;
    }

    const previousState = interactionState;
    const willBookmark = !previousState.isBookmarked;
    const requestId = bookmarkRequestIdRef.current + 1;
    bookmarkRequestIdRef.current = requestId;

    const action = willBookmark
      ? createBookmarkAction(postId)
      : deleteBookmarkAction(postId);

    dispatch({ type: "toggle_bookmark" });
    await handleAction(action, {
      actionName: willBookmark ? "create_bookmark" : "delete_bookmark",
      onError: () => {
        if (bookmarkRequestIdRef.current !== requestId) {
          return;
        }

        dispatch({
          type: "rollback_bookmark",
          previousState: {
            isBookmarked: previousState.isBookmarked,
            bookmarkCount: previousState.bookmarkCount,
          },
        });
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
