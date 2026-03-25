"use client";

import React, { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { PostDialog } from "@/features/post-interaction";
import { getTodayPostByUserIdAction } from "@/features/post-list";
import { useAuth, UserAvatar } from "@/entities/user";
import { getCurrentLocalDayContext } from "@/shared/lib/date";
import { captureEvent } from "@/shared/lib/posthog";
import { POST_LIST_QUERY_KEY } from "@/shared/lib/query/post-list-query";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

/**
 * 게시글 피드 화면 상단에 표출되어, 사용자가 게시글을 작성할 수 있도록 하는 컴포넌트
 * @returns PostCard
 */
export default function PostCard() {
  const { user, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const localDayContext = useMemo(() => getCurrentLocalDayContext(), []);
  const todayPostQuery = useQuery({
    queryKey: [...POST_LIST_QUERY_KEY, "today", "mine", user?.id, localDayContext],
    queryFn: async () => {
      const result = await getTodayPostByUserIdAction(localDayContext);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data ?? null;
    },
    enabled: Boolean(user),
  });

  const openCreateDialog = (
    e:
      | React.FocusEvent<HTMLTextAreaElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    captureEvent("post_dialog_opened", { source: "create_post_widget" });
    setIsDialogOpen(true);
    if (e.target instanceof HTMLTextAreaElement) {
      e.target.blur();
    }
  };

  const openEditDialog = () => {
    captureEvent("post_dialog_opened", { source: "today_post_edit" });
    setIsDialogOpen(true);
  };

  if (!user || loading) {
    return null;
  }

  const todayPost = todayPostQuery.data ?? null;
  const isCheckingTodayPost = todayPostQuery.isLoading;

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      {isDialogOpen && (
        <PostDialog
          isOpen={isDialogOpen}
          handleClose={handleCloseDialog}
          post={todayPost ?? undefined}
          source={todayPost ? "today_post_edit" : "create_post_widget"}
        />
      )}
      <div className="bg-transparent border-background p-2">
        <div className="flex gap-2 items-center">
          <UserAvatar user={user} />
          <Textarea
            placeholder="오늘은 무엇을 배웠나요?"
            className="resize-none min-h-4"
            value={todayPost ? "오늘의 기록을 이미 남겼어요." : ""}
            readOnly
            disabled={isCheckingTodayPost}
            onFocus={(event) => {
              if (!todayPost) {
                openCreateDialog(event);
              }
            }}
          />
          <Button
            variant="outline"
            onClick={todayPost ? openEditDialog : openCreateDialog}
            disabled={isCheckingTodayPost}
          >
            {todayPost ? "오늘 글 수정" : "게시"}
          </Button>
        </div>
      </div>
    </>
  );
}
