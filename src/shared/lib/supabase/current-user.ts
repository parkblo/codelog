import { createClient } from "@/shared/lib/supabase/server";
import { UserAuth } from "@/shared/types";

import "server-only";

export async function getCurrentUserAuth(): Promise<UserAuth | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, username, nickname, avatar, bio")
    .eq("id", user.id)
    .is("deleted_at", null)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile as UserAuth;
}
