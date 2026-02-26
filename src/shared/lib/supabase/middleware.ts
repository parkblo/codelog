// utils/supabase/middleware.ts
import { type NextRequest,NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { Database } from "@/shared/types/database.types";

/**
 * 인증 토큰 재발급 및 쿠키 동기화를 거쳐 Supabase 세션을 업데이트합니다.
 *
 * @param {NextRequest} request - incoming Next.js 요청 객체
 * @returns {Promise<NextResponse>} 세션 리프레시 후 업데이트된 쿠키가 담긴 객체
 */

export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshing the auth token can fail for stale/invalid refresh cookies.
  // In that case, force sign-out once so middleware clears auth cookies.
  try {
    const {
      error,
    } = await supabase.auth.getUser();

    if (error && "code" in error && error.code === "refresh_token_not_found") {
      await supabase.auth.signOut();
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "refresh_token_not_found"
    ) {
      await supabase.auth.signOut();
    }
  }

  return supabaseResponse;
}
