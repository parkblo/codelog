import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DatabaseAdapter, setDatabaseAdapter } from "@/shared/lib/database";

import { follow } from "./follow.service";
import { getFollowers } from "./follow.service";
import { getFollowing } from "./follow.service";
import { isFollowing } from "./follow.service";

function createMockAdapter(
  overrides: Partial<DatabaseAdapter> = {},
): DatabaseAdapter {
  return {
    query: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    rpc: vi.fn(),
    getCurrentAuthUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    updateCurrentAuthUserMetadata: vi.fn(),
    ...overrides,
  } as unknown as DatabaseAdapter;
}

describe("follow.service", () => {
  let adapter: DatabaseAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
    setDatabaseAdapter(adapter);
  });

  it("자기 자신 팔로우는 즉시 차단한다", async () => {
    const result = await follow("user-1", "user-1");

    expect(result.error?.message).toBe("자기 자신을 팔로우할 수 없습니다.");
    expect(adapter.query).not.toHaveBeenCalled();
    expect(adapter.insert).not.toHaveBeenCalled();
  });

  it("대상 사용자가 없으면 에러를 반환한다", async () => {
    vi.mocked(adapter.query).mockResolvedValue({
      data: null,
      error: null,
      count: null,
    });

    const result = await follow("user-1", "missing-user");

    expect(result.error?.message).toBe("존재하지 않는 사용자입니다.");
    expect(adapter.insert).not.toHaveBeenCalled();
  });

  it("대상 사용자가 있으면 follows insert를 수행한다", async () => {
    vi.mocked(adapter.query).mockResolvedValue({
      data: { id: "target-user" },
      error: null,
      count: null,
    });
    vi.mocked(adapter.insert).mockResolvedValue({ error: null });

    const result = await follow("user-1", "target-user");

    expect(result.error).toBeNull();
    expect(adapter.insert).toHaveBeenCalledWith("follows", {
      follower_id: "user-1",
      following_id: "target-user",
    });
  });

  it("팔로워 목록을 Author 형식으로 매핑한다", async () => {
    vi.mocked(adapter.query).mockResolvedValue({
      data: [
        {
          follower: {
            id: "u1",
            username: "alpha",
            nickname: "Alpha",
            avatar: "avatar-1",
            bio: "bio-1",
          },
        },
        { follower: null },
      ],
      error: null,
      count: null,
    });

    const result = await getFollowers("profile-user");

    expect(result.error).toBeNull();
    expect(result.data).toEqual([
      {
        id: "u1",
        username: "alpha",
        nickname: "Alpha",
        avatar: "avatar-1",
        bio: "bio-1",
      },
    ]);
  });

  it("팔로잉 목록을 Author 형식으로 매핑한다", async () => {
    vi.mocked(adapter.query).mockResolvedValue({
      data: [
        {
          following: {
            id: "u2",
            username: "beta",
            nickname: "Beta",
            avatar: "avatar-2",
            bio: "bio-2",
          },
        },
        { following: null },
      ],
      error: null,
      count: null,
    });

    const result = await getFollowing("profile-user");

    expect(result.error).toBeNull();
    expect(result.data).toEqual([
      {
        id: "u2",
        username: "beta",
        nickname: "Beta",
        avatar: "avatar-2",
        bio: "bio-2",
      },
    ]);
  });

  it("isFollowing은 soft-delete 되지 않은 관계만 true로 본다", async () => {
    vi.mocked(adapter.query).mockResolvedValue({
      data: [
        { following: { id: "u2", deleted_at: null } },
        { following: { id: "u2", deleted_at: "2026-01-01T00:00:00.000Z" } },
      ],
      error: null,
      count: null,
    });

    const result = await isFollowing("u1", "u2");

    expect(result.error).toBeNull();
    expect(result.data).toBe(true);
  });
});
