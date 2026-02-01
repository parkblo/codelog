"use client";

import { Bookmark, Heart, MessageCircle, Share } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

interface PostActionsProps {
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLikeClick: () => void;
  onCommentClick: () => void;
  onBookmarkClick: () => void;
}

export function PostActions({
  likeCount,
  commentCount,
  bookmarkCount,
  isLiked,
  isBookmarked,
  onLikeClick,
  onCommentClick,
  onBookmarkClick,
}: PostActionsProps) {
  return (
    <div className="flex gap-4 border-t pt-2 justify-between">
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
        onClick={onLikeClick}
      >
        <Heart
          className={cn("w-4 h-4", isLiked && "text-red-500")}
          fill={isLiked ? "red" : "none"}
        />
        <span>{likeCount}</span>
      </Button>
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
        onClick={onCommentClick}
      >
        <MessageCircle className="w-4 h-4" />
        <span>{commentCount}</span>
      </Button>
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
        onClick={onBookmarkClick}
      >
        <Bookmark
          className={cn("w-4 h-4", isBookmarked && "text-blue-500")}
          fill={isBookmarked ? "#3b82f6" : "none"}
        />
        <span>{bookmarkCount}</span>
      </Button>
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
      >
        <Share className="w-4 h-4" />
      </Button>
    </div>
  );
}
