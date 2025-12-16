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
import PostDialog from "@/components/post/PostDialog";
import { useState } from "react";
import { Post } from "@/types/types";

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
          onSelect={() => deletePostAction(post.id)}
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
