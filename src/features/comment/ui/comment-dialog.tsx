"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";

import { updateCommentAction } from "@/entities/comment";
import { useAuth, UserAvatar } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { Comment } from "@/shared/types/types";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";

import { type CommentFormData, commentSchema } from "../model/comment.schema";

interface CommentDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  comment: Comment;
}

export default function CommentDialog({
  isOpen,
  handleClose,
  comment,
}: CommentDialogProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: comment?.content || "" },
  });

  const onSubmit = async (data: CommentFormData) => {
    if (!user) return;

    await handleAction(
      updateCommentAction(comment.id, comment.post_id, {
        content: data.content,
      }),
      {
        onSuccess: () => {
          handleClose();
        },
        successMessage: "댓글이 수정되었습니다.",
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>댓글 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {user && <UserAvatar user={user} />}
              <Textarea
                className="resize-none"
                placeholder="댓글을 입력해주세요."
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
                <Pencil className="w-4 h-4" />
                수정
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
