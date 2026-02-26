"use client";

import { useState } from "react";

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
}

export function usePostInteraction({
  postId,
  initialIsLiked = false,
  initialIsBookmarked = false,
}: UsePostInteractionProps) {
  const { user, openAuthModal } = useAuth();
  const [likedState, setLikedState] = useState(initialIsLiked);
  const [bookmarkedState, setBookmarkedState] = useState(initialIsBookmarked);
  const isLiked = user ? likedState : false;
  const isBookmarked = user ? bookmarkedState : false;

  const handleLikeClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_like" });
      openAuthModal("login");
      return;
    }

    const previousState = likedState;
    setLikedState(!likedState);

    const action = likedState
      ? deletePostLikeAction(postId)
      : createPostLikeAction(postId);

    await handleAction(action, {
      actionName: likedState ? "delete_post_like" : "create_post_like",
      onError: () => setLikedState(previousState),
    });
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_bookmark" });
      openAuthModal("login");
      return;
    }

    const previousState = bookmarkedState;
    setBookmarkedState(!bookmarkedState);

    const action = bookmarkedState
      ? deleteBookmarkAction(postId)
      : createBookmarkAction(postId);

    await handleAction(action, {
      actionName: bookmarkedState ? "delete_bookmark" : "create_bookmark",
      onError: () => setBookmarkedState(previousState),
    });
  };

  return {
    isLiked,
    isBookmarked,
    handleLikeClick,
    handleBookmarkClick,
  };
}
