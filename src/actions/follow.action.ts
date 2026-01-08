"use server";

import { ServerAuthService } from "@/services/auth/server-auth.service";
import { FollowService } from "@/services/follow/follow.service";
import { revalidatePath } from "next/cache";

/**
 * 사용자를 팔로우하는 서버 액션입니다.
 * @param followingId 팔로우할 대상 사용자의 ID
 * @param followingUsername 팔로우할 대상 사용자의 유저네임
 */
export async function followUserAction(
  followingId: string,
  followingUsername?: string
) {
  const authService = new ServerAuthService();
  const followService = new FollowService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  if (user.id === followingId) {
    return { error: "자기 자신을 팔로우할 수 없습니다." };
  }

  const { error } = await followService.follow(user.id, followingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/profile/${user.username}`);

  if (followingUsername) {
    revalidatePath(`/profile/${followingUsername}`);
  }

  return { error: null };
}

/**
 * 팔로우를 취소하는 서버 액션입니다.
 * @param followingId 팔로우를 취소할 대상 사용자의 ID
 * @param followingUsername 팔로우를 취소할 대상 사용자의 유저네임
 */
export async function unfollowUserAction(
  followingId: string,
  followingUsername?: string
) {
  const authService = new ServerAuthService();
  const followService = new FollowService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await followService.unfollow(user.id, followingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/profile/${user.username}`);

  if (followingUsername) {
    revalidatePath(`/profile/${followingUsername}`);
  }

  return { error: null };
}

/**
 * 현재 사용자의 팔로우 여부를 확인하는 서버 액션입니다.
 * @param followingId 확인 대상 사용자의 ID
 */
export async function isFollowingAction(followingId: string) {
  const authService = new ServerAuthService();
  const followService = new FollowService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { data: false, error: null };
  }

  const { data, error } = await followService.isFollowing(user.id, followingId);

  if (error) {
    return { data: false, error: error.message };
  }

  return { data, error: null };
}
