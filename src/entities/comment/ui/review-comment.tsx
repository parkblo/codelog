"use client";

import { Comment } from "@/shared/types/types";
import { formatRelativeTime } from "@/shared/lib/utils/date";
import { CommentForm } from "@/features/comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { handleAction } from "@/shared/lib/utils/handle-action";

import {
  createCommentLikeAction,
  deleteCommentLikeAction,
} from "@/entities/like/api/like.action";

import { Heart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import { CommentMenu } from "@/features/comment";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/providers/auth-provider";
import { renderContent } from "@/shared/lib/utils/text";

interface ReviewCommentProps {
  lineComments: Comment[];
}

export default function ReviewComment({ lineComments }: ReviewCommentProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [isLiked, setIsLiked] = useState<(boolean | undefined)[]>(
    lineComments.map((comment) => comment.is_liked)
  );

  const handleLikeClick = async (idx: number) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

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

  const handleAuthorClick = (username: string) => {
    router.push(`/profile/${username}`);
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
              <Avatar
                className="w-8 h-8 border border-border hover:cursor-pointer"
                onClick={() => handleAuthorClick(comment.author.username)}
              >
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
                  <span
                    className="font-medium text-sm text-foreground hover:cursor-pointer"
                    onClick={() => handleAuthorClick(comment.author.username)}
                  >
                    {comment.author.nickname}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.created_at)}
                  </span>
                  <span
                    className="text-xs text-muted-foreground flex gap-1 items-center p-1"
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
                  {renderContent(comment.content)}
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
