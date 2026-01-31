"use server";

import { revalidatePath } from "next/cache";

import { ServerAuthService } from "@/shared/lib/auth/server-auth.service";
import { UserService } from "@/entities/user/api/user.service";
import { UserAuth } from "@/shared/types/types";

export async function editUserAction(user: UserAuth) {
  const authService = new ServerAuthService();
  const currentUser = await authService.getCurrentUser();

  if (!currentUser) {
    return { error: "로그인이 필요합니다." };
  }

  if (currentUser.id !== user.id) {
    return { error: "본인의 정보만 수정할 수 있습니다." };
  }

  const userService = new UserService();
  const { error } = await userService.editUser(user);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/profile/${user.username}`);

  return { error: null };
}

export async function updateAvatarAction(
  userId: string,
  username: string,
  avatarUrl: string,
) {
  const authService = new ServerAuthService();
  const currentUser = await authService.getCurrentUser();

  if (!currentUser || currentUser.id !== userId) {
    return { error: "권한이 없습니다." };
  }

  const userService = new UserService();
  const { error } = await userService.updateAvatar(userId, avatarUrl);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/profile/${username}`);

  return { error: null };
}

export async function getRandomFeaturedUsersAction(count: number) {
  const authService = new ServerAuthService();
  const currentUser = await authService.getCurrentUser();

  const userService = new UserService();
  const { data, error } = await userService.getRandomFeaturedUsers(
    count,
    currentUser?.id,
  );

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
