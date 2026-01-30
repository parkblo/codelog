import { createClient } from "@/shared/lib/utils/supabase/server";
import { Author, UserAuth } from "@/shared/types/types";

import { IUserService } from "./user.interface";

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

    // 1단계: 유저 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, username, nickname, bio, avatar")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      return { data: null, error: userError };
    }

    // 2단계: 팔로우 여부 확인 (로그인한 경우)
    let isFollowing = false;
    if (currentUserId) {
      const { data: followData, error: followError } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userData.id)
        .eq("follower_id", currentUserId)
        .limit(1)
        .maybeSingle();

      if (!followError && followData) {
        isFollowing = true;
      }
    }

    return {
      data: {
        ...userData,
        is_following: isFollowing,
      } as UserAuth & { is_following?: boolean },
      error: null,
    };
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

    // 1단계: 랜덤 유저 ID 목록 가져오기 (본인 제외 처리를 위해 1명 더 넉넉하게 요청)
    const fetchCount = currentUserId ? count + 1 : count;
    const { data: featuredIds, error: rpcError } = await supabase.rpc(
      "get_random_featured_users",
      {
        p_count: fetchCount,
      }
    );

    if (rpcError || !featuredIds) {
      return { data: null, error: rpcError };
    }

    const ids = (featuredIds as { id: string }[])
      .map((u) => u.id)
      .filter((id) => id !== currentUserId)
      .slice(0, count);

    // 2단계: 유저 상세 정보 조회
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username, nickname, bio, avatar")
      .in("id", ids);

    if (usersError || !usersData) {
      return { data: null, error: usersError };
    }

    // 3단계: 팔로우 여부 대량 조회 (로그인한 경우)
    let followedIds: Set<string> = new Set();
    if (currentUserId && usersData.length > 0) {
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId)
        .in(
          "following_id",
          usersData.map((u) => u.id)
        );

      if (follows) {
        followedIds = new Set(follows.map((f) => f.following_id));
      }
    }

    const users = usersData.map((user) => ({
      ...user,
      is_following: followedIds.has(user.id),
    }));

    return {
      data: users as Author[],
      error: null,
    };
  }
}
