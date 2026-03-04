import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DatabaseAdapter, setDatabaseAdapter } from "@/shared/lib/database";

import { createComment, getCommentsByPostId } from "./comment.service";

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

describe("comment.service", () => {
  let adapter: DatabaseAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
    setDatabaseAdapter(adapter);
  });

  it("createComment는 게시글 확인 중 오류를 그대로 반환한다", async () => {
    const dbError = new Error("db failed");
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: null,
      error: dbError,
      count: null,
    });

    const result = await createComment({
      content: "hello",
      postId: 10,
      userId: "user-1",
      startLine: null,
      endLine: null,
    });

    expect(result).toEqual({ data: null, error: dbError });
    expect(adapter.insert).not.toHaveBeenCalled();
  });

  it("createComment는 존재하지 않는 게시글일 때 삽입을 수행하지 않는다", async () => {
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: null,
      error: null,
      count: null,
    });

    const result = await createComment({
      content: "hello",
      postId: 10,
      userId: "user-1",
      startLine: null,
      endLine: null,
    });

    expect(result.error?.message).toBe("포스트를 찾을 수 없습니다.");
    expect(adapter.insert).not.toHaveBeenCalled();
  });

  it("createComment는 게시글이 유효하면 comment를 생성한다", async () => {
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: { id: 10 },
      error: null,
      count: null,
    });
    vi.mocked(adapter.insert).mockResolvedValueOnce({
      data: { id: 1, content: "hello" },
      error: null,
      count: null,
    });

    const result = await createComment({
      content: "hello",
      postId: 10,
      userId: "user-1",
      startLine: 3,
      endLine: 4,
    });

    expect(result.error).toBeNull();
    expect(adapter.insert).toHaveBeenCalledWith(
      "comments",
      {
        content: "hello",
        post_id: 10,
        user_id: "user-1",
        start_line: 3,
        end_line: 4,
      },
      expect.objectContaining({ mode: "single" }),
    );
  });

  it("getCommentsByPostId는 general 타입에서 or 조건을 사용한다", async () => {
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: [],
      error: null,
      count: null,
    });

    await getCommentsByPostId(11, { type: "general", offset: -2, limit: 10 });

    expect(adapter.query).toHaveBeenCalledWith(
      expect.objectContaining({
        table: "comments",
        or: "start_line.is.null,end_line.is.null",
        notFilters: undefined,
        range: { from: 0, to: 9 },
      }),
    );
  });

  it("getCommentsByPostId는 review 타입에서 notFilters를 사용한다", async () => {
    vi.mocked(adapter.query).mockResolvedValueOnce({
      data: [],
      error: null,
      count: null,
    });

    await getCommentsByPostId(11, { type: "review", offset: 5, limit: 2 });

    expect(adapter.query).toHaveBeenCalledWith(
      expect.objectContaining({
        or: undefined,
        notFilters: [
          { column: "start_line", operator: "is", value: null },
          { column: "end_line", operator: "is", value: null },
        ],
        range: { from: 5, to: 6 },
      }),
    );
  });
});
