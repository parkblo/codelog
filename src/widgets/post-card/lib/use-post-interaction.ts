"use client";

import { useEffect, useState } from "react";

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

export function usePostInteraction({
  postId,
  initialIsLiked = false,
  initialIsBookmarked = false,
  initialLikeCount = 0,
  initialBookmarkCount = 0,
}: UsePostInteractionProps) {
  const { user, openAuthModal } = useAuth();
  const [likedState, setLikedState] = useState(initialIsLiked);
  const [bookmarkedState, setBookmarkedState] = useState(initialIsBookmarked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const isLiked = user ? likedState : false;
  const isBookmarked = user ? bookmarkedState : false;

  useEffect(() => {
    setLikedState(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setBookmarkedState(initialIsBookmarked);
  }, [initialIsBookmarked]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  useEffect(() => {
    setBookmarkCount(initialBookmarkCount);
  }, [initialBookmarkCount]);

  const handleLikeClick = async () => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "post_like" });
      openAuthModal("login");
      return;
    }

    const willLike = !likedState;
    const previousState = likedState;
    const previousCount = likeCount;
    setLikedState(willLike);
    setLikeCount((prev) => (willLike ? prev + 1 : Math.max(0, prev - 1)));

    const action = likedState
      ? deletePostLikeAction(postId)
      : createPostLikeAction(postId);

    await handleAction(action, {
      actionName: likedState ? "delete_post_like" : "create_post_like",
      onError: () => {
        setLikedState(previousState);
        setLikeCount(previousCount);
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
    const previousState = bookmarkedState;
    const previousCount = bookmarkCount;
    setBookmarkedState(willBookmark);
    setBookmarkCount((prev) =>
      willBookmark ? prev + 1 : Math.max(0, prev - 1),
    );

    const action = bookmarkedState
      ? deleteBookmarkAction(postId)
      : createBookmarkAction(postId);

    await handleAction(action, {
      actionName: bookmarkedState ? "delete_bookmark" : "create_bookmark",
      onError: () => {
        setBookmarkedState(previousState);
        setBookmarkCount(previousCount);
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
