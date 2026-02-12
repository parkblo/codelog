"use client";

import { Bookmark, Heart, MessageCircle, Share } from "lucide-react";

import { cn } from "@/shared/lib";
import { handleAction } from "@/shared/lib/handle-action";
import { captureEvent } from "@/shared/lib/posthog";
import { Button } from "@/shared/ui/button";

interface PostActionsProps {
  postId: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLikeClick: () => void;
  onCommentClick: () => void;
  onBookmarkClick: () => void;
}

async function copyPostUrlAction(postId: number) {
  if (typeof window === "undefined") {
    return { error: "링크 복사에 실패했습니다." };
  }

  const postUrl = `${window.location.origin}/post/${postId}`;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(postUrl);
      return { error: null, message: "게시글 링크가 복사되었습니다." };
    }

    const textarea = document.createElement("textarea");
    textarea.value = postUrl;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const isCopied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (isCopied) {
      return { error: null, message: "게시글 링크가 복사되었습니다." };
    }

    return { error: "링크 복사에 실패했습니다." };
  } catch {
    return { error: "링크 복사에 실패했습니다." };
  }
}

export function PostActions({
  postId,
  likeCount,
  commentCount,
  bookmarkCount,
  isLiked,
  isBookmarked,
  onLikeClick,
  onCommentClick,
  onBookmarkClick,
}: PostActionsProps) {
  const handleShareClick = async () => {
    captureEvent("post_share_clicked", { post_id: postId });
    await handleAction(copyPostUrlAction(postId), {
      actionName: "copy_post_url",
    });
  };

  return (
    <div className="flex gap-4 border-t pt-2 justify-between">
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
        onClick={() => {
          captureEvent("post_like_clicked", {
            post_id: postId,
            will_like: !isLiked,
          });
          onLikeClick();
        }}
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
        onClick={() => {
          captureEvent("post_comment_clicked", { post_id: postId });
          onCommentClick();
        }}
      >
        <MessageCircle className="w-4 h-4" />
        <span>{commentCount}</span>
      </Button>
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
        onClick={() => {
          captureEvent("post_bookmark_clicked", {
            post_id: postId,
            will_bookmark: !isBookmarked,
          });
          onBookmarkClick();
        }}
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
        onClick={() => void handleShareClick()}
      >
        <Share className="w-4 h-4" />
      </Button>
    </div>
  );
}
