import { redirect } from "next/navigation";

import { ServerAuthService } from "@/entities/user";
import { getAuthRedirectUrl } from "@/shared/lib/utils/auth";
import type { UserAuth } from "@/shared/types/types";

import "server-only";

/**
 * 인증된 사용자를 반환하거나, 미인증 시 로그인 페이지로 리다이렉트합니다.
 * 서버 컴포넌트에서만 사용 가능합니다.
 *
 * @param redirectPath - 로그인 후 돌아올 경로
 * @returns 인증된 사용자 정보
 */
export async function requireAuth(redirectPath: string): Promise<UserAuth> {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect(getAuthRedirectUrl(redirectPath));
  }

  return user;
}
