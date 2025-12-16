"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Comment } from "@/types/types";
import { deleteCommentAction } from "@/actions/comment.action";
import CommentDialog from "./CommentDialog";

export default function CommentMenu({ comment }: { comment: Comment }) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  const isOwner = user.id === comment.author.id;

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
          onSelect={() => deleteCommentAction(comment.id, comment.post_id)}
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
