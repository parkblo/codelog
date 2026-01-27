import { UserAuth } from "@/shared/types/types";
import { createClient } from "@/shared/lib/utils/supabase/client";
import { IAuthService, SignUpProps } from "./auth.interface";
export class ClientAuthService implements IAuthService {
  private supabase = createClient();

  async getCurrentUser(): Promise<UserAuth | null> {
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await this.supabase
      .from("users")
      .select("id, username, nickname, avatar, bio")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile as UserAuth;
  }

  async signInWithOAuth(provider: "github", options?: { redirectTo: string }) {
    return await this.supabase.auth.signInWithOAuth({
      provider,
      options,
    });
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    return await this.supabase.auth.signInWithPassword(credentials);
  }

  async signUp(credentials: SignUpProps) {
    const { email, password, data } = credentials;

    return await this.supabase.auth.signUp({
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

  async signOut(): Promise<{ error: Error | null }> {
    return await this.supabase.auth.signOut();
  }
}
