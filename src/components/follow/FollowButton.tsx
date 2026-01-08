"use client";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "../ui/button";
import { followUserAction, unfollowUserAction } from "@/actions/follow.action";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

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

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal("login");
      return;
    }

    const originalState = isFollowing;
    // 낙관적 업데이트
    setIsFollowing(!originalState);

    startTransition(async () => {
      const action = originalState ? unfollowUserAction : followUserAction;
      const { error } = await action(followingId, followingUsername);

      if (error) {
        setIsFollowing(originalState);
        toast.error(error);
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
