import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DatabaseAdapter, setDatabaseAdapter } from "@/shared/lib/database";

import { getPosts, updatePost } from "./post.service";

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

describe("post.service", () => {
  let adapter: DatabaseAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
    setDatabaseAdapter(adapter);
  });

  it("getPosts는 필터 조합/키워드를 query 옵션에 반영한다", async () => {
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: [],
      error: null,
      count: null,
    });

    await getPosts({
      authorId: "author-1",
      likedByUserId: "liked-user",
      bookmarkedByUserId: "bookmark-user",
      tag: "typescript",
      keyword: "a,b_%(test)",
      offset: -1,
      limit: 3,
    });

    expect(adapter.query).toHaveBeenCalledWith(
      expect.objectContaining({
        table: "posts",
        filters: expect.arrayContaining([
          { column: "deleted_at", operator: "is", value: null },
          { column: "author.deleted_at", operator: "is", value: null },
          { column: "post_likes.user_id", value: "liked-user" },
          { column: "bookmarks.user_id", value: "bookmark-user" },
          { column: "filter_tags.tags.name", value: "typescript" },
          { column: "user_id", value: "author-1" },
        ]),
        range: { from: 0, to: 2 },
        or: "description.ilike.%a b\\_\\% test%,content.ilike.%a b\\_\\% test%,code.ilike.%a b\\_\\% test%",
      }),
    );
  });

  it("getPosts는 태그 관계를 문자열 배열로 매핑한다", async () => {
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          tags: [{ tags: { name: "ts" } }, { tags: null }, { tags: { name: "db" } }],
        },
      ],
      error: null,
      count: null,
    });

    const result = await getPosts();

    expect(result.error).toBeNull();
    expect(result.data?.[0]?.tags).toEqual(["ts", "db"]);
  });

  it("updatePost는 RPC 성공 후 getPostById 조회 결과를 반환한다", async () => {
    vi.mocked(adapter.rpc).mockResolvedValueOnce({
      data: null,
      error: null,
      count: null,
    });
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: { id: 99, author: { id: "author-1" }, tags: [] },
      error: null,
      count: null,
    });

    const result = await updatePost(99, {
      content: "updated",
      description: "summary",
      code: "const x = 1;",
      language: "typescript",
      authoring_mode: "ai_assisted",
      tags: ["ts", "vitest"],
    });

    expect(adapter.rpc).toHaveBeenCalledWith("update_post_with_tags", {
      p_post_id: 99,
      post_data: {
        content: "updated",
        description: "summary",
        code: "const x = 1;",
        language: "typescript",
        authoring_mode: "ai_assisted",
      },
      tags: ["ts", "vitest"],
    });
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe(99);
  });

  it("updatePost는 RPC 실패 시 즉시 에러를 반환한다", async () => {
    const rpcError = new Error("rpc failed");
    vi.mocked(adapter.rpc).mockResolvedValueOnce({
      data: null,
      error: rpcError,
      count: null,
    });

    const result = await updatePost(100, {
      content: "updated",
      tags: [],
    });

    expect(result).toEqual({ data: null, error: rpcError });
    expect(adapter.query).not.toHaveBeenCalled();
  });
});
