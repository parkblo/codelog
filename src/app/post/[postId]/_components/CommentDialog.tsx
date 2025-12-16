"use client";

import { updateCommentAction } from "@/actions/comment.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { Comment } from "@/types/types";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { handleAction } from "@/utils/handle-action";

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
  const [commentInput, setCommentInput] = useState(comment?.content || "");

  const updateComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commentInput && user) {
      await handleAction(
        updateCommentAction(comment.id, comment.post_id, {
          content: commentInput,
        }),
        {
          onSuccess: () => {
            handleClose();
          },
          successMessage: "댓글이 수정되었습니다.",
        }
      );
    } else if (!user) {
      toast.error("먼저 로그인 해주세요.");
    } else {
      toast.error("댓글을 작성해주세요.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>댓글 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={updateComment}>
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
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
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
