"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Heart } from "lucide-react";

import {
  createCommentLikeAction,
  deleteCommentLikeAction,
} from "@/entities/like/api/like.action";
import { cn } from "@/shared/lib/utils";
import { formatRelativeTime } from "@/shared/lib/utils/date";
import { handleAction } from "@/shared/lib/utils/handle-action";
import { renderContent } from "@/shared/lib/utils/text";
import { Comment as CommentType } from "@/shared/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import CommentMenu from "./comment-menu";

interface commentProps {
  comment: CommentType;
}

export default function Comment({ comment }: commentProps) {
  const router = useRouter();
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

  const handleAuthorClick = () => {
    router.push(`/profile/${comment.author.username}`);
  };

  return (
    <Card>
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
