import { UserAuth } from "@/types/types";
import { createClient } from "@/utils/supabase/server";
import { IAuthService } from "./auth.interface";
import { mapSupabaseUserToDomainUser } from "@/utils/auth-mapper";

export class ServerAuthService implements IAuthService {
  async getCurrentUser(): Promise<UserAuth | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    const domainUser = mapSupabaseUserToDomainUser(data.user);
    return domainUser;
  }
}
