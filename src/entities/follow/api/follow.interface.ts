import { Author } from "@/shared/types/types";

export interface IFollowService {
  /**
   * 사용자를 팔로우합니다.
   * @param followerId 팔로우를 하는 사용자 ID
   * @param followingId 팔로우를 받는 사용자 ID
   */
  follow(
    followerId: string,
    followingId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 팔로우를 취소합니다.
   * @param followerId 팔로우를 취소하는 사용자 ID
   * @param followingId 팔로우 대상 사용자 ID
   */
  unfollow(
    followerId: string,
    followingId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 특정 사용자를 팔로우하는 사람들의 목록을 가져옵니다.
   * @param userId 대상 사용자 ID
   */
  getFollowers(
    userId: string
  ): Promise<{ data: Author[] | null; error: Error | null }>;

  /**
   * 특정 사용자가 팔로우하고 있는 사람들의 목록을 가져옵니다.
   * @param userId 대상 사용자 ID
   */
  getFollowing(
    userId: string
  ): Promise<{ data: Author[] | null; error: Error | null }>;

  /**
   * 팔로우 여부를 확인합니다.
   * @param followerId 팔로우 여부를 확인하는 사용자 ID
   * @param followingId 대상 사용자 ID
   */
  isFollowing(
    followerId: string,
    followingId: string
  ): Promise<{ data: boolean; error: Error | null }>;

  /**
   * 특정 사용자의 팔로워 수를 가져옵니다.
   * @param userId 대상 사용자 ID
   */
  getFollowersCount(
    userId: string
  ): Promise<{ data: number; error: Error | null }>;

  /**
   * 특정 사용자의 팔로잉 수를 가져옵니다.
   * @param userId 대상 사용자 ID
   */
  getFollowingCount(
    userId: string
  ): Promise<{ data: number; error: Error | null }>;
}
