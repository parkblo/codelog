import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  followMock,
  getCurrentUserAuthMock,
  getFollowersMock,
  getFollowingMock,
  isFollowingMock,
  revalidatePathMock,
  unfollowMock,
} = vi.hoisted(() => ({
  followMock: vi.fn(),
  unfollowMock: vi.fn(),
  isFollowingMock: vi.fn(),
  getFollowersMock: vi.fn(),
  getFollowingMock: vi.fn(),
  getCurrentUserAuthMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/entities/follow/api/follow.service", () => ({
  follow: followMock,
  unfollow: unfollowMock,
  isFollowing: isFollowingMock,
  getFollowers: getFollowersMock,
  getFollowing: getFollowingMock,
}));

vi.mock("@/shared/lib/supabase/current-user", () => ({
  getCurrentUserAuth: getCurrentUserAuthMock,
}));

import {
  followUserAction,
  isFollowingAction,
  unfollowUserAction,
} from "./follow.action";

describe("follow.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유저네임 형식이 잘못되면 즉시 실패한다", async () => {
    const result = await followUserAction("target-id", "../bad");

    expect(result).toEqual({ error: "유효하지 않은 유저네임입니다." });
    expect(getCurrentUserAuthMock).not.toHaveBeenCalled();
  });

  it("로그인되지 않은 사용자는 팔로우할 수 없다", async () => {
    getCurrentUserAuthMock.mockResolvedValue(null);

    const result = await followUserAction("target-id", "target_user");

    expect(result).toEqual({ error: "로그인이 필요합니다." });
    expect(followMock).not.toHaveBeenCalled();
  });

  it("팔로우 성공 시 현재 유저/대상 프로필 경로를 재검증한다", async () => {
    getCurrentUserAuthMock.mockResolvedValue({
      id: "me",
      username: "myname",
    });
    followMock.mockResolvedValue({ error: null });

    const result = await followUserAction("target-id", "target_name");

    expect(result).toEqual({ error: null });
    expect(followMock).toHaveBeenCalledWith("me", "target-id");
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile/myname");
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile/target_name");
  });

  it("언팔로우에서도 유저네임 검증을 적용한다", async () => {
    const result = await unfollowUserAction("target-id", "bad/name");

    expect(result).toEqual({ error: "유효하지 않은 유저네임입니다." });
    expect(getCurrentUserAuthMock).not.toHaveBeenCalled();
  });

  it("isFollowingAction은 미로그인 상태에서 false를 반환한다", async () => {
    getCurrentUserAuthMock.mockResolvedValue(null);

    const result = await isFollowingAction("target-id");

    expect(result).toEqual({ data: false, error: null });
    expect(isFollowingMock).not.toHaveBeenCalled();
  });
});
