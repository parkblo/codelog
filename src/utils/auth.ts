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
