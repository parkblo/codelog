"use client";

import { useState } from "react";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { EllipsisVertical } from "lucide-react";

import { useAuth } from "@/app/providers/auth-provider";
import { PostDialog } from "@/features/post-interaction";
import { deletePostAction } from "@/entities/post";
import { handleAction } from "@/shared/lib/utils/handle-action";
import { Post } from "@/shared/types/types";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";

interface PostMenuProps {
  post: Post;
}

export default function PostMenu({ post }: PostMenuProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  const isOwner = user.id === post.author.id;

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
            await handleAction(deletePostAction(post.id), {
              successMessage: "게시글이 삭제되었습니다.",
            });
          }}
          disabled={!isOwner}
        >
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
      {isDialogOpen && (
        <PostDialog
          isOpen={isDialogOpen}
          handleClose={() => setIsDialogOpen(false)}
          post={post}
        />
      )}
    </DropdownMenu>
  );
}
