import { User } from "@/types/types";
import { createClient } from "@/utils/supabase/server";
import { IAuthService } from "./auth.interface";

export class ServerAuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }
}
