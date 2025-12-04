import { User as SupabaseUser } from "@supabase/supabase-js";
import { UserAuth } from "@/types/types";

export const mapSupabaseUserToDomainUser = (user: SupabaseUser): UserAuth => {
  const { user_metadata } = user;
  return {
    id: user.id,
    nickname:
      user_metadata.nick_name ||
      user_metadata.full_name ||
      user_metadata.name ||
      (user.email?.split("@")[0] ?? "undefined"),
    avatar: user_metadata.avatar_url || user_metadata.picture,
    username: user_metadata.user_name || user.email,
  };
};
