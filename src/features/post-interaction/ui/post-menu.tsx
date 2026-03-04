"use client";

import { useState } from "react";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical } from "lucide-react";

import { PostDialog } from "@/features/post-interaction";
import { deletePostAction } from "@/entities/post";
import { useAuth } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { captureEvent } from "@/shared/lib/posthog";
import { POST_LIST_QUERY_KEY } from "@/shared/lib/query/post-list-query";
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
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deletePostMutation = useMutation({
    mutationFn: () =>
      handleAction(deletePostAction(post.id), {
        actionName: "delete_post",
        successMessage: "게시글이 삭제되었습니다.",
      }),
    onSuccess: async (result) => {
      if (result === null) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: POST_LIST_QUERY_KEY });
    },
  });

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
            captureEvent("post_edit_clicked", { post_id: post.id });
            setIsDialogOpen(true);
          }}
        >
          수정
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            captureEvent("post_delete_clicked", { post_id: post.id });
            await deletePostMutation.mutateAsync();
          }}
          disabled={!isOwner || deletePostMutation.isPending}
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
