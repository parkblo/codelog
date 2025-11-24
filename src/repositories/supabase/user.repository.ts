import { User } from "@/types/types";
import { UserRepository } from "../user.repository";
import { createClient } from "@/utils/supabase/server";

export class SupabaseUserRepository implements UserRepository {
  async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }
}
