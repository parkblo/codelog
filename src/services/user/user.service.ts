import { UserAuth } from "@/types/types";
import { IUserService } from "./user.interface";
import { createClient } from "@/utils/supabase/server";

export class UserService implements IUserService {
  async editUser(user: Pick<UserAuth, "id" | "nickname" | "bio" | "avatar">) {
    const { id, nickname, bio, avatar } = user;
    const supabase = await createClient();

    const { error } = await supabase
      .from("users")
      .update({
        nickname,
        bio,
        avatar,
      })
      .eq("id", id);

    return { error };
  }

  async getUserByUsername(username: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("id, username, nickname, bio, avatar")
      .eq("username", username)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  async getUserContributions(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_user_contributions", {
      target_user_id: id,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  async updateAvatar(id: string, avatar: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("users")
      .update({ avatar })
      .eq("id", id);

    if (error) {
      return { error };
    }

    // Sync auth metadata to trigger onAuthStateChange
    await supabase.auth.updateUser({
      data: { avatar_url: avatar },
    });

    return { error };
  }
}
