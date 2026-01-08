"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { Send } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { createCommentAction } from "@/actions/comment.action";
import { handleAction } from "@/utils/handle-action";

export default function CommentForm({
  postId,
  startLine,
  endLine,
}: {
  postId: number;
  startLine?: number | null;
  endLine?: number | null;
}) {
  const { user, loading, openAuthModal } = useAuth();
  const [comment, setComment] = useState("");

  const handleFocus = () => {
    if (!user && !loading) {
      openAuthModal("login");
    }
  };

  const createComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (comment && user) {
      await handleAction(
        createCommentAction({
          content: comment,
          postId,
          userId: user.id,
          startLine,
          endLine,
        }),
        {
          onSuccess: () => {
            setComment("");
          },
          successMessage: "댓글이 작성되었습니다.",
        }
      );
    } else if (!user) {
      openAuthModal("login");
    } else {
      toast.error("댓글을 작성해주세요.");
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={createComment}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Avatar className="w-10 h-10 border border-border">
                {user && (
                  <>
                    <AvatarImage src={user.avatar || ""} alt={user.nickname} />
                    <AvatarFallback>
                      {user.nickname ? user.nickname.charAt(0) : ""}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <Textarea
                className="resize-none"
                placeholder="댓글을 입력해주세요."
                value={comment}
                onFocus={handleFocus}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" type="submit">
                <Send className="w-4 h-4" />
                댓글 작성
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
