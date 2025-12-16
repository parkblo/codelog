"use client";

import {
  createCommentLikeAction,
  deleteCommentLikeAction,
} from "@/actions/like.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Comment as CommentType } from "@/types/types";
import { formatRelativeTime } from "@/utils/date";
import { Heart } from "lucide-react";
import { useState } from "react";
import CommentMenu from "./CommentMenu";
import { handleAction } from "@/utils/handle-action";

interface commentProps {
  comment: CommentType;
}

export default function Comment({ comment }: commentProps) {
  const [isLiked, setIsLiked] = useState(comment.is_liked);

  const handleLikeClick = async () => {
    const previousState = isLiked;
    setIsLiked(!isLiked);

    const action = isLiked
      ? deleteCommentLikeAction(comment.post_id, comment.id)
      : createCommentLikeAction(comment.post_id, comment.id);

    await handleAction(action, {
      onError: () => setIsLiked(previousState),
    });
  };

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Avatar className="w-10 h-10 border border-border">
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
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <span className="text-foreground">
                  {comment.author.nickname}
                </span>
                <span className="text-muted-foreground text-sm">
                  @{comment.author.username}
                </span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">
                  {formatRelativeTime(comment.created_at || "")}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                {comment.content}
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
                  <span>{comment.like_count}</span>
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
