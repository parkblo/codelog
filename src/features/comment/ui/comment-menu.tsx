"use client";

import { useState } from "react";

import { EllipsisVertical } from "lucide-react";

import { CommentDialog } from "@/features/comment";
import { deleteCommentAction } from "@/entities/comment";
import { useAuth } from "@/entities/user";
import { handleAction } from "@/shared/lib/utils/handle-action";
import { Comment } from "@/shared/types/types";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { DropdownMenuContent } from "@/shared/ui/dropdown-menu";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";

export default function CommentMenu({ comment }: { comment: Comment }) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  const isOwner = user.id === comment.author.id;

  if (!isOwner) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={!isOwner}
          onSelect={(e) => {
            e.preventDefault();
            setIsDialogOpen(true);
          }}
        >
          수정
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            await handleAction(
              deleteCommentAction(comment.id, comment.post_id),
              { successMessage: "댓글이 삭제되었습니다." },
            );
          }}
          disabled={!isOwner}
        >
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
      {isDialogOpen && (
        <CommentDialog
          key={comment.id}
          isOpen={isDialogOpen}
          handleClose={() => setIsDialogOpen(false)}
          comment={comment}
        />
      )}
    </DropdownMenu>
  );
}
