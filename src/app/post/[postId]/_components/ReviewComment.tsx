"use client";

import { Comment } from "@/types/types";
import { formatRelativeTime } from "@/utils/date";
import CommentForm from "./CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handleAction } from "@/utils/handle-action";

import {
  createCommentLikeAction,
  deleteCommentLikeAction,
} from "@/actions/like.action";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CommentMenu from "./CommentMenu";

interface ReviewCommentProps {
  lineComments: Comment[];
}

export default function ReviewComment({ lineComments }: ReviewCommentProps) {
  const [isLiked, setIsLiked] = useState<(boolean | undefined)[]>(
    lineComments.map((comment) => comment.is_liked)
  );

  const handleLikeClick = async (idx: number) => {
    const previousState = isLiked;
    setIsLiked((prev) => {
      const newState = [...prev];
      newState[idx] = !newState[idx];
      return newState;
    });

    const action = isLiked[idx]
      ? deleteCommentLikeAction(lineComments[idx].post_id, lineComments[idx].id)
      : createCommentLikeAction(
          lineComments[idx].post_id,
          lineComments[idx].id
        );

    await handleAction(action, {
      onError: () => setIsLiked(previousState),
    });
  };

  return (
    <div
      className="flex flex-col gap-2 mt-2"
      style={{
        fontFamily: "var(--font-pretendard), sans-serif",
      }}
    >
      {lineComments.map((comment, idx) => (
        <div
          key={comment.id}
          className="bg-muted/50 rounded-md p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex gap-3 justify-between">
            <div className="flex gap-3 w-full">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage
                  src={comment.author.avatar || ""}
                  alt={comment.author.nickname}
                />
                <AvatarFallback>
                  {comment.author.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 w-full min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">
                    {comment.author.nickname}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.created_at)}
                  </span>
                  <span
                    className="text-xs text-muted-foreground flex gap-1 items-center p-1 cursor-pointer"
                    onClick={() => handleLikeClick(idx)}
                  >
                    <Heart
                      className={cn("w-3 h-3", isLiked[idx] && "text-red-500")}
                      fill={isLiked[idx] ? "red" : "none"}
                    />
                    <span>{comment.like_count}</span>
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
            <CommentMenu comment={comment} />
          </div>
        </div>
      ))}
      <div className="w-full p-2 animate-in fade-in zoom-in-95 duration-200 text-foreground">
        <CommentForm
          postId={lineComments[0].post_id}
          startLine={lineComments[0].start_line}
          endLine={lineComments[0].end_line}
        />
      </div>
    </div>
  );
}
