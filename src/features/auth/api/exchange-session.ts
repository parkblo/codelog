import { createClient } from "@/shared/lib/utils/supabase/server";

export async function exchangeAuthCode(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error };
}
