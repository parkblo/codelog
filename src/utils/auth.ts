import { User as SupabaseUser } from "@supabase/supabase-js";
import { UserAuth } from "@/types/types";

/**
 * 로그인 권한이 필요한 경우 홈(home)으로 리다이렉트할 URL을 생성합니다.
 * 리턴 후 돌아올 경로(next)를 안전하게 인코딩하여 포함합니다.
 *
 * @param nextPath - 로그인 성공 후 돌아갈 상대 경로 (예: "/profile")
 * @returns 포맷팅된 리다이렉트 URL
 */
export function getAuthRedirectUrl(nextPath: string): string {
  return `/home/?auth=required&next=${encodeURIComponent(nextPath)}`;
}

/**
 * Supabase 사용자 객체를 도메인 사용자 객체로 변환합니다.
 * @param user Supabase 사용자 객체
 * @returns 도메인 사용자 객체
 */
export const mapSupabaseUserToDomainUser = (user: SupabaseUser): UserAuth => {
  const { user_metadata } = user;
  return {
    id: user.id,
    nickname:
      user_metadata.nick_name ||
      user_metadata.full_name ||
      user_metadata.name ||
      (user.email?.split("@")[0] ?? "undefined"),
    avatar: user_metadata.avatar_url || user_metadata.picture,
    username: user_metadata.user_name || user.email,
    bio: user_metadata.bio || null,
  };
};
