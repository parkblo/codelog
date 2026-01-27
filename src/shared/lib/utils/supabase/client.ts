import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/shared/types/database.types";

/**
 * 클라이언트 사이드에서 사용될 Supabase 클라이언트 인스턴스를 만듭니다.
 *
 * 이 함수는 오직 클라이언트 컴포넌트 내에서만 사용되어야 합니다.
 *
 * @returns {ReturnType<typeof createBrowserClient<Database>>} Supabase 클라이언트 인스턴스
 */

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
