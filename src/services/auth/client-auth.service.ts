import { User } from "@/types/types";
import { createClient } from "@/utils/supabase/client";
import { IAuthService } from "./auth.interface";
import { mapSupabaseUserToDomainUser } from "@/utils/auth-mapper";

export class ClientAuthService implements IAuthService {
  private supabase = createClient();

  async getCurrentUser(): Promise<User | null> {
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

  async signUp(credentials: {
    email: string;
    password: string;
    options?: any;
  }) {
    return await this.supabase.auth.signUp(credentials);
  }
}
