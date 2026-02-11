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
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  const handleLikeClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_like" });
      openAuthModal("login");
      return;
    }

    const previousState = isLiked;
    setIsLiked(!isLiked);

    const action = isLiked
      ? deletePostLikeAction(postId)
      : createPostLikeAction(postId);

    await handleAction(action, {
      actionName: isLiked ? "delete_post_like" : "create_post_like",
      onError: () => setIsLiked(previousState),
    });
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_bookmark" });
      openAuthModal("login");
      return;
    }

    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    const action = isBookmarked
      ? deleteBookmarkAction(postId)
      : createBookmarkAction(postId);

    await handleAction(action, {
      actionName: isBookmarked ? "delete_bookmark" : "create_bookmark",
      onError: () => setIsBookmarked(previousState),
    });
  };

  return {
    isLiked,
    isBookmarked,
    handleLikeClick,
    handleBookmarkClick,
  };
}
