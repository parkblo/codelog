import { createClient } from "@/shared/lib/supabase/server";

export async function exchangeAuthCode(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error };
}
