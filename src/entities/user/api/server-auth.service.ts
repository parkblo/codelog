import { createClient } from "@/shared/lib/utils/supabase/server";
import { UserAuth } from "@/shared/types/types";

import { IAuthService } from "./auth.interface";

export class ServerAuthService implements IAuthService {
  async getCurrentUser(): Promise<UserAuth | null> {
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
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile as UserAuth;
  }
}
