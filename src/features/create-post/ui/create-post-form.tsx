"use client";

import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import React, { useState } from "react";
import { PostDialog } from "@/features/post-interaction";

/**
 * 게시글 피드 화면 상단에 표출되어, 사용자가 게시글을 작성할 수 있도록 하는 컴포넌트
 * @returns PostCard
 */
export default function PostCard() {
  const { user, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user || loading) {
    return null;
  }

  const openDialog = (
    e:
      | React.FocusEvent<HTMLTextAreaElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    // TODO - 게시글 작성 모달을 띄우기 위한 함수
    setIsDialogOpen(true);
    if (e.target instanceof HTMLTextAreaElement) {
      e.target.blur();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      {isDialogOpen && (
        <PostDialog isOpen={isDialogOpen} handleClose={handleCloseDialog} />
      )}
      <div className="bg-background border-background p-2">
        <div className="flex gap-2 items-center">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={user.avatar || ""} alt={user.nickname} />
            <AvatarFallback>
              {user.nickname ? user.nickname.charAt(0) : ""}
            </AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="무엇을 공유할까요?"
            className="resize-none min-h-4"
            onFocus={openDialog}
          />
          <Button variant="outline" onClick={openDialog}>
            게시
          </Button>
        </div>
      </div>
    </>
  );
}
