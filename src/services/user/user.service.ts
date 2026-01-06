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
}
