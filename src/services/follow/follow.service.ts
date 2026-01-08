import { createClient } from "@/utils/supabase/server";
import { IFollowService } from "./follow.interface";
import { Author } from "@/types/types";

export class FollowService implements IFollowService {
  async follow(
    followerId: string,
    followingId: string
  ): Promise<{ error: Error | null }> {
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
    const { data, error } = await supabase
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

    if (error) return { data: null, error };
    return {
      data: (data as unknown as { follower: Author }[]).map(
        (item) => item.follower
      ),
      error: null,
    };
  }

  async getFollowing(
    userId: string
  ): Promise<{ data: Author[] | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
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

    if (error) return { data: null, error };
    return {
      data: (data as unknown as { following: Author }[]).map(
        (item) => item.following
      ),
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
}
