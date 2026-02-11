"use client";

import { useEffect, useState, useTransition } from "react";

import { Loader2, UserCheck, UserPlus } from "lucide-react";

import { followUserAction, unfollowUserAction } from "@/entities/follow";
import { useAuth } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { captureEvent } from "@/shared/lib/posthog";
import { Button } from "@/shared/ui/button";

interface FollowButtonProps {
  followingId: string;
  followingUsername: string;
  initialIsFollowing: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function FollowButton({
  followingId,
  followingUsername,
  initialIsFollowing,
  size = "default",
  className,
}: FollowButtonProps) {
  const { user, openAuthModal } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return; // 중복 요청 방지

    if (!user) {
      captureEvent("auth_required_modal_opened", { source: "follow_button" });
      openAuthModal("login");
      return;
    }

    const originalState = isFollowing;
    // 낙관적 업데이트
    setIsFollowing(!originalState);

    startTransition(async () => {
      const action = originalState ? unfollowUserAction : followUserAction;
      captureEvent(originalState ? "unfollow_clicked" : "follow_clicked", {
        target_user_id: followingId,
      });
      const result = await handleAction(
        action(followingId, followingUsername),
        {
          actionName: originalState ? "unfollow_user" : "follow_user",
          successMessage: `${
            isFollowing ? "언팔로우" : "팔로우"
          }에 성공했습니다.`,
        },
      );

      if (result === null && !originalState) {
        // 에러 발생 시 원래 상태로 복구 (팔로우 시도 중 에러)
        setIsFollowing(originalState);
      } else if (result === null && originalState) {
        // 언팔로우 시도 중 에러
        setIsFollowing(originalState);
      }
    });
  };

  return (
    <Button
      size={size}
      variant={isFollowing ? "outline" : "default"}
      className={`${className} gap-1`}
      disabled={isPending}
      onClick={handleFollow}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? "언팔로우" : "팔로우"}
    </Button>
  );
}
