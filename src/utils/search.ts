/**
 * 사용자 입력 검색어를 안전하게 다듬고 검증합니다.
 * @param query 사용자가 입력한 검색어
 * @returns 정제된 검색어 문자열
 */
export function sanitizeSearchQuery(query: string | null | undefined): string {
  if (!query) return "";

  return query.trim().slice(0, 100);
}
