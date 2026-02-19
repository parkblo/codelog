import { QueryData } from "@supabase/supabase-js";

import { createClient } from "@/shared/lib/supabase/server";
import { Author } from "@/shared/types/types";

import { IFollowService } from "./follow.interface";

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
    const { data: targetUser, error: targetUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", followingId)
      .is("deleted_at", null)
      .maybeSingle();

    if (targetUserError || !targetUser) {
      return { error: new Error("존재하지 않는 사용자입니다.") };
    }

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
        follower:users!follows_follower_id_fkey!inner (
          id,
          username,
          nickname,
          avatar,
          bio
        )
      `
      )
      .eq("following_id", userId)
      .is("follower.deleted_at", null);

    type FollowersWithAuthor = QueryData<typeof query>;
    const { data, error } = await query;

    if (error) return { data: null, error };

    const followerRows = (data as FollowersWithAuthor) ?? [];

    // inner join으로 사용자 존재를 보장하지만 타입상 nullable 가능성을 제거합니다.
    const followers = followerRows
      .map((item) => item.follower)
      .filter((follower): follower is Author => follower !== null)
      .map((follower) => ({
        id: follower.id,
        username: follower.username,
        nickname: follower.nickname,
        avatar: follower.avatar,
        bio: follower.bio,
      }));

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
        following:users!follows_following_id_fkey!inner (
          id,
          username,
          nickname,
          avatar,
          bio
        )
      `
      )
      .eq("follower_id", userId)
      .is("following.deleted_at", null);

    type FollowingWithAuthor = QueryData<typeof query>;
    const { data, error } = await query;

    if (error) return { data: null, error };

    const followingRows = (data as FollowingWithAuthor) ?? [];

    // inner join으로 사용자 존재를 보장하지만 타입상 nullable 가능성을 제거합니다.
    const following = followingRows
      .map((item) => item.following)
      .filter((followingUser): followingUser is Author => followingUser !== null)
      .map((followingUser) => ({
        id: followingUser.id,
        username: followingUser.username,
        nickname: followingUser.nickname,
        avatar: followingUser.avatar,
        bio: followingUser.bio,
      }));

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
    const query = supabase
      .from("follows")
      .select(
        `
          following:users!follows_following_id_fkey (
            id,
            deleted_at
          )
        `
      )
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    type IsFollowingResult = QueryData<typeof query>;
    const { data, error } = await query;

    if (error) return { data: false, error };

    const rows = (data as IsFollowingResult) ?? [];
    const isActiveFollowing = rows.some(
      (item) => item.following && item.following.deleted_at === null
    );

    return { data: isActiveFollowing, error: null };
  }

  async getFollowersCount(
    userId: string
  ): Promise<{ data: number; error: Error | null }> {
    const supabase = await createClient();
    const query = supabase
      .from("follows")
      .select(
        `
          follower:users!follows_follower_id_fkey (
            id,
            deleted_at
          )
        `
      )
      .eq("following_id", userId);

    type FollowersCountResult = QueryData<typeof query>;
    const { data, error } = await query;

    if (error) return { data: 0, error };

    const rows = (data as FollowersCountResult) ?? [];
    const count = rows.filter(
      (item) => item.follower && item.follower.deleted_at === null
    ).length;

    return { data: count, error: null };
  }

  async getFollowingCount(
    userId: string
  ): Promise<{ data: number; error: Error | null }> {
    const supabase = await createClient();
    const query = supabase
      .from("follows")
      .select(
        `
          following:users!follows_following_id_fkey (
            id,
            deleted_at
          )
        `
      )
      .eq("follower_id", userId);

    type FollowingCountResult = QueryData<typeof query>;
    const { data, error } = await query;

    if (error) return { data: 0, error };

    const rows = (data as FollowingCountResult) ?? [];
    const count = rows.filter(
      (item) => item.following && item.following.deleted_at === null
    ).length;

    return { data: count, error: null };
  }
}
