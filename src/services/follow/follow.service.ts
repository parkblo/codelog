import { createClient } from "@/shared/lib/utils/supabase/server";
import { IFollowService } from "./follow.interface";
import { Author } from "@/shared/types/types";
import { QueryData } from "@supabase/supabase-js";

export class FollowService implements IFollowService {
  async follow(
    followerId: string,
    followingId: string
  ): Promise<{ error: Error | null }> {
    // 자기 자신 팔로우 방지
    if (followerId === followingId) {
      return { error: new Error("자기 자신을 팔로우할 수 없습니다.") };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("follows").insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) return { error };
    return { error: null };
  }

  async unfollow(
    followerId: string,
    followingId: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) return { error };
    return { error: null };
  }

  async getFollowers(
    userId: string
  ): Promise<{ data: Author[] | null; error: Error | null }> {
    const supabase = await createClient();
    const query = supabase
      .from("follows")
      .select(
        `
        follower:users!follows_follower_id_fkey (
          id,
          username,
          nickname,
          avatar,
          bio
        )
      `
      )
      .eq("following_id", userId);

    type FollowersWithAuthor = QueryData<typeof query>;
    const { data, error } = await query;

    if (error) return { data: null, error };

    // 타입 가드를 통해 null 제외 및 안전한 캐스팅
    const followers = (data as FollowersWithAuthor)
      .map((item) => item.follower)
      .filter((follower): follower is Author => follower !== null);

    return {
      data: followers,
      error: null,
    };
  }

  async getFollowing(
    userId: string
  ): Promise<{ data: Author[] | null; error: Error | null }> {
    const supabase = await createClient();
    const query = supabase
      .from("follows")
      .select(
        `
        following:users!follows_following_id_fkey (
          id,
          username,
          nickname,
          avatar,
          bio
        )
      `
      )
      .eq("follower_id", userId);

    type FollowingWithAuthor = QueryData<typeof query>;
    const { data, error } = await query;

    if (error) return { data: null, error };

    // 타입 가드를 통해 null 제외 및 안전한 캐스팅
    const following = (data as FollowingWithAuthor)
      .map((item) => item.following)
      .filter((following): following is Author => following !== null);

    return {
      data: following,
      error: null,
    };
  }

  async isFollowing(
    followerId: string,
    followingId: string
  ): Promise<{ data: boolean; error: Error | null }> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) return { data: false, error };
    return { data: (count || 0) > 0, error: null };
  }

  async getFollowersCount(
    userId: string
  ): Promise<{ data: number; error: Error | null }> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (error) return { data: 0, error };
    return { data: count || 0, error: null };
  }

  async getFollowingCount(
    userId: string
  ): Promise<{ data: number; error: Error | null }> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (error) return { data: 0, error };
    return { data: count || 0, error: null };
  }
}
