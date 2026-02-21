import { createClient } from "@/shared/lib/supabase/client";
import { UserAuth } from "@/shared/types/types";

import { AuthCredentials, OAuthOptions, SignUpProps } from "./auth.interface";

export async function getCurrentUserFromClient(): Promise<UserAuth | null> {
  const supabase = createClient();

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

export async function signInWithOAuth(
  provider: "github",
  options?: OAuthOptions,
) {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options,
  });
}

export async function signInWithPassword(credentials: AuthCredentials) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword(credentials);
}

export async function signUp(credentials: SignUpProps) {
  const supabase = createClient();
  const { email, password, data } = credentials;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: data.user_name,
        full_name: data.nick_name,
        avatar_url: data.avatar_url,
      },
    },
  });
}

export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = createClient();
  return supabase.auth.signOut();
}
