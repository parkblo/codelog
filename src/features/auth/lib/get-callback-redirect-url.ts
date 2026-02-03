interface GetCallbackRedirectUrlParams {
  origin: string;
  next: string;
  forwardedHost: string | null;
}

/**
 * OAuth 콜백 후 리다이렉트할 URL을 결정합니다.
 * - 개발 환경: origin 사용
 * - 프로덕션 환경: forwarded host 또는 origin 사용
 */
export function getCallbackRedirectUrl({
  origin,
  next,
  forwardedHost,
}: GetCallbackRedirectUrlParams): string {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return `${origin}${next}`;
  }

  if (forwardedHost) {
    return `https://${forwardedHost}${next}`;
  }

  return `${origin}${next}`;
}
