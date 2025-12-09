import { UserAuth } from "@/types/types";
import { createClient } from "@/utils/supabase/client";
import { IAuthService, SignUpProps } from "./auth.interface";
import { mapSupabaseUserToDomainUser } from "@/utils/auth-mapper";

export class ClientAuthService implements IAuthService {
  private supabase = createClient();

  async getCurrentUser(): Promise<UserAuth | null> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    const domainUser = mapSupabaseUserToDomainUser(data.user);
    return domainUser;
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
