"use client";

import { startTransition, useMemo, useOptimistic } from "react";
import { useRouter } from "next/navigation";

import { Heart } from "lucide-react";

import {
  createCommentLikeAction,
  deleteCommentLikeAction,
} from "@/entities/like/api/like.action";
import { cn, isLoganBotUser } from "@/shared/lib";
import { formatRelativeTime } from "@/shared/lib/date";
import { handleAction } from "@/shared/lib/handle-action";
import { renderContent } from "@/shared/lib/text";
import { Comment as CommentType } from "@/shared/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import CommentMenu from "./comment-menu";

interface commentProps {
  comment: CommentType;
}

export default function Comment({ comment }: commentProps) {
  const router = useRouter();
  const isLoganBot = isLoganBotUser(comment.author.id);
  const initialState = useMemo(
    () => ({
      isLiked: Boolean(comment.is_liked),
      likeCount: comment.like_count,
    }),
    [comment.is_liked, comment.like_count],
  );
  const [optimisticComment, setOptimisticComment] = useOptimistic(
    initialState,
    (_, next: { isLiked: boolean; likeCount: number }) => next,
  );
  const { isLiked, likeCount } = optimisticComment;

  const handleLikeClick = () => {
    const willLike = !isLiked;
    const previousState = { isLiked, likeCount };
    const nextState = {
      isLiked: willLike,
      likeCount: willLike ? likeCount + 1 : Math.max(0, likeCount - 1),
    };
    const action = isLiked
      ? deleteCommentLikeAction(comment.post_id, comment.id)
      : createCommentLikeAction(comment.post_id, comment.id);

    startTransition(async () => {
      setOptimisticComment(nextState);
      await handleAction(action, {
        actionName: isLiked ? "delete_comment_like" : "create_comment_like",
        onError: () => {
          setOptimisticComment(previousState);
        },
      });
    });
  };

  const handleAuthorClick = () => {
    router.push(`/profile/${comment.author.username}`);
  };

  return (
    <Card
      className={cn(
        isLoganBot &&
          "border-sky-200 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/30",
      )}
    >
      <CardContent>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Avatar
              className="w-10 h-10 border border-border hover:cursor-pointer"
              onClick={handleAuthorClick}
            >
              {comment.author && (
                <>
                  <AvatarImage
                    src={comment.author.avatar || ""}
                    alt={comment.author.nickname}
                  />
                  <AvatarFallback>
                    {comment.author.nickname
                      ? comment.author.nickname.charAt(0)
                      : ""}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <span
                  className="flex gap-1 items-center hover:cursor-pointer"
                  onClick={handleAuthorClick}
                >
                  <span className="font-medium text-sm text-foreground">
                    {comment.author.nickname}
                  </span>
                  {isLoganBot && (
                    <Badge
                      variant="secondary"
                      className="border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-900/70 dark:text-sky-100"
                    >
                      Bot
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-sm">
                    @{comment.author.username}
                  </span>
                </span>

                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">
                  {formatRelativeTime(comment.created_at || "")}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap wrap-break-word leading-relaxed">
                {renderContent(comment.content)}
              </p>
              <div className="flex gap-4 pt-2 justify-start">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
                  onClick={handleLikeClick}
                >
                  <Heart
                    className={cn("w-4 h-4", isLiked && "text-red-500")}
                    fill={isLiked ? "red" : "none"}
                  />
                  <span>{likeCount}</span>
                </Button>
              </div>
            </div>
          </div>

          <CommentMenu comment={comment} />
        </div>
      </CardContent>
    </Card>
  );
}
