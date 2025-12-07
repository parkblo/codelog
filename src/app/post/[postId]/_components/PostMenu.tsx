"use client";

import { deletePostAction, updatePostAction } from "@/actions/post.action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { EllipsisVertical } from "lucide-react";

interface PostMenuProps {
  authorId: string;
  postId: number;
}

export default function PostMenu({ authorId, postId }: PostMenuProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isOwner = user.id === authorId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled={!isOwner}>수정</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => deletePostAction(postId)}
          disabled={!isOwner}
        >
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
