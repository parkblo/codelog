"use client";

import React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";

import { createCommentAction } from "@/entities/comment";
import { useAuth } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { captureEvent } from "@/shared/lib/posthog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";

import { type CommentFormData,commentSchema } from "../model/comment.schema";

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const handleFocus = () => {
    if (!user && !loading) {
      captureEvent("auth_required_modal_opened", { source: "comment_form_focus" });
      openAuthModal("login");
    }
  };

  const onSubmit = async (data: CommentFormData) => {
    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "comment_submit" });
      openAuthModal("login");
      return;
    }

    captureEvent("comment_submitted", { post_id: postId });

    await handleAction(
      createCommentAction({
        content: data.content,
        postId,
        userId: user.id,
        startLine,
        endLine,
      }),
      {
        actionName: "create_comment",
        onSuccess: () => {
          reset();
        },
        successMessage: "댓글이 작성되었습니다.",
      },
    );
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
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
                onFocus={handleFocus}
                {...register("content")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
            </div>
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
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
