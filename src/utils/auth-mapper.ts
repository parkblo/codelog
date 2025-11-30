import { User as SupabaseUser } from "@supabase/supabase-js";
import { User as DomainUser } from "@/types/types";

export const mapSupabaseUserToDomainUser = (user: SupabaseUser): DomainUser => {
  const { user_metadata } = user;
  return {
    id: user.id,
    email: user.email ?? "undefined",
    nickname:
      user_metadata.full_name ||
      user_metadata.name ||
      (user.email?.split("@")[0] ?? "undefined"),
    avatar: user_metadata.avatar_url || user_metadata.picture,
    username: user_metadata.user_name || user.email,
  };
};
