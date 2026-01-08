import { Author, UserAuth, UserContribution } from "@/types/types";
import { IUserService } from "./user.interface";
import { createClient } from "@/utils/supabase/server";
import { QueryData } from "@supabase/supabase-js";

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

  async getUserByUsername(username: string, currentUserId?: string) {
    const supabase = await createClient();

    if (currentUserId) {
      const query = supabase
        .from("users")
        .select(
          `
          id, username, nickname, bio, avatar,
          is_following:follows!follows_following_id_fkey(follower_id)
        `
        )
        .eq("username", username)
        .eq("follows.follower_id", currentUserId)
        .single();

      type UserWithFollow = QueryData<typeof query>;
      const { data, error } = await query;

      if (error || !data) {
        return { data: null, error };
      }

      const userData = data as UserWithFollow;
      return {
        data: {
          ...userData,
          is_following:
            Array.isArray(userData.is_following) &&
            userData.is_following.length > 0,
        } as UserAuth & { is_following?: boolean },
        error: null,
      };
    } else {
      const query = supabase
        .from("users")
        .select("id, username, nickname, bio, avatar")
        .eq("username", username)
        .single();

      const { data, error } = await query;

      if (error || !data) {
        return { data: null, error };
      }

      return {
        data: {
          ...data,
          is_following: false,
        } as UserAuth & { is_following?: boolean },
        error: null,
      };
    }
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
    const { error: dbError } = await supabase
      .from("users")
      .update({ avatar })
      .eq("id", id);

    if (dbError) {
      return { error: dbError };
    }

    // Sync auth metadata to trigger onAuthStateChange
    const { error: authError } = await supabase.auth.updateUser({
      data: { avatar_url: avatar },
    });

    if (authError) {
      return { error: authError };
    }

    return { error: null };
  }

  async getRandomFeaturedUsers(count: number, currentUserId?: string) {
    const supabase = await createClient();

    const { data: featuredIds, error: rpcError } = await supabase.rpc(
      "get_random_featured_users",
      {
        p_count: count,
      }
    );

    if (rpcError || !featuredIds) {
      return { data: null, error: rpcError };
    }

    const ids = (featuredIds as { id: string }[]).map((u) => u.id);

    if (currentUserId) {
      const query = supabase
        .from("users")
        .select(
          `
          id, username, nickname, bio, avatar,
          is_following:follows!follows_following_id_fkey(follower_id)
        `
        )
        .in("id", ids)
        .eq("follows.follower_id", currentUserId);

      type FeaturedUsersWithFollow = QueryData<typeof query>;
      const { data, error } = await query;

      if (error) {
        return { data: null, error };
      }

      const userDataList = data as FeaturedUsersWithFollow;
      return {
        data: userDataList.map((user) => ({
          ...user,
          is_following:
            Array.isArray(user.is_following) && user.is_following.length > 0,
        })) as Author[],
        error: null,
      };
    } else {
      const query = supabase
        .from("users")
        .select("id, username, nickname, bio, avatar")
        .in("id", ids);

      const { data, error } = await query;

      if (error) {
        return { data: null, error };
      }

      return {
        data: data.map((user) => ({
          ...user,
          is_following: false,
        })) as Author[],
        error: null,
      };
    }
  }
}
