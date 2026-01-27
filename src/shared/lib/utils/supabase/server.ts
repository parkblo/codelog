import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/shared/types/database.types";

/**
 * 서버 사이드에서 사용될 Supabase 클라이언트 인스턴스를 만듭니다.
 *
 * @returns {Promise<ReturnType<typeof createServerClient>>} Supabase 클라이언트 인스턴스
 */

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (err) {
            console.warn("Failed to set cookies in server context:", err);
          }
        },
      },
    }
  );
}
