export const HOME_PATH = "/home";

const PROTECTED_ROUTE_PREFIXES = [
  "/home",
  "/today",
  "/explore",
  "/profile",
  "/bookmarks",
  "/search",
  "/settings",
];

function normalizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return HOME_PATH;
  }

  return nextPath;
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((routePrefix) => {
    return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
  });
}

export function getPathWithSearch(pathname: string, search: string): string {
  return `${pathname}${search}`;
}

/**
 * 로그인 권한이 필요한 경우 랜딩 페이지로 리다이렉트할 URL을 생성합니다.
 * 리턴 후 돌아올 경로(next)를 안전하게 인코딩하여 포함합니다.
 */
export function getAuthRedirectUrl(nextPath: string): string {
  return `/?auth=required&next=${encodeURIComponent(normalizeNextPath(nextPath))}`;
}
