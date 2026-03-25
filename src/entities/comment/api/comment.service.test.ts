import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  type DatabaseAdapter,
  getDatabaseAdapter,
  setDatabaseAdapter,
} from "@/shared/lib/database";
import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/shared/types/database.types";
import { Comment } from "@/shared/types/types";

import { createComment, deleteComment, getCommentsByPostId } from "./comment.service";

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

class FakeCommentDatabaseAdapter {
  private nextCommentId = 1;

  constructor(
    readonly users: Tables<"users">[],
    readonly posts: Tables<"posts">[],
    readonly comments: Tables<"comments">[] = [],
  ) {}

  async query<T>(options: {
    table: string;
    filters?: { column: string; value: unknown; operator?: string }[];
  }) {
    if (options.table !== "posts") {
      return { data: null, count: null, error: null };
    }

    const post = this.posts.find((candidate) => {
      const author = this.users.find((user) => user.id === candidate.user_id);

      return (options.filters ?? []).every((filter) => {
        if (filter.column === "id") {
          return candidate.id === filter.value;
        }

        if (filter.column === "deleted_at" && filter.operator === "is") {
          return candidate.deleted_at === filter.value;
        }

        if (
          filter.column === "author.deleted_at" &&
          filter.operator === "is"
        ) {
          return author?.deleted_at === filter.value;
        }

        return true;
      });
    });

    return { data: (post ?? null) as T | null, count: null, error: null };
  }

  async insert<T>(table: string, values: TablesInsert<"comments">) {
    if (table !== "comments") {
      throw new Error(`Unexpected insert table: ${table}`);
    }

    const author = this.users.find((user) => user.id === values.user_id);
    const post = this.posts.find((candidate) => candidate.id === values.post_id);

    if (!author || !post) {
      return { data: null, count: null, error: new Error("Missing relation") };
    }

    const commentRow: Tables<"comments"> = {
      id: this.nextCommentId++,
      created_at: new Date().toISOString(),
      updated_at: null,
      deleted_at: values.deleted_at ?? null,
      content: values.content,
      post_id: values.post_id,
      user_id: values.user_id,
      like_count: values.like_count ?? 0,
      start_line: values.start_line ?? null,
      end_line: values.end_line ?? null,
    };

    this.comments.push(commentRow);

    // Simulate the DB trigger contract enforced by the migration.
    if (commentRow.deleted_at === null) {
      post.comment_count += 1;
    }

    const createdComment: Comment = {
      ...commentRow,
      author: {
        id: author.id,
        username: author.username,
        nickname: author.nickname,
        avatar: author.avatar,
        bio: author.bio,
      },
    };

    return { data: createdComment as T, count: null, error: null };
  }

  async update<T>(
    table: string,
    values: TablesUpdate<"comments">,
    filters: { column: string; value: unknown; operator?: string }[] = [],
  ) {
    if (table !== "comments") {
      throw new Error(`Unexpected update table: ${table}`);
    }

    const comment = this.comments.find((candidate) =>
      filters.every((filter) => {
        if (filter.column === "id") {
          return candidate.id === filter.value;
        }

        if (filter.column === "deleted_at" && filter.operator === "is") {
          return candidate.deleted_at === filter.value;
        }

        return true;
      }),
    );

    if (!comment) {
      return { data: null as T | null, count: null, error: null };
    }

    const previousDeletedAt = comment.deleted_at;
    Object.assign(comment, values);

    if (previousDeletedAt === null && comment.deleted_at !== null) {
      const post = this.posts.find((candidate) => candidate.id === comment.post_id);

      if (post) {
        post.comment_count = Math.max(post.comment_count - 1, 0);
      }
    }

    if (previousDeletedAt !== null && comment.deleted_at === null) {
      const post = this.posts.find((candidate) => candidate.id === comment.post_id);

      if (post) {
        post.comment_count += 1;
      }
    }

    return { data: null as T | null, count: null, error: null };
  }
}

const originalAdapter = getDatabaseAdapter();

function createFakeAdapter() {
  return new FakeCommentDatabaseAdapter(
    [
      {
        id: "user-1",
        username: "parkblo",
        nickname: "Park",
        avatar: null,
        bio: null,
        password: null,
        created_at: "2026-03-12T00:00:00.000Z",
        updated_at: null,
        deleted_at: null,
      },
    ],
    [
      {
        id: 10,
        user_id: "user-1",
        content: "post",
        description: "post summary",
        code: null,
        language: null,
        authoring_mode: "hand_written",
        created_at: "2026-03-12T00:00:00.000Z",
        updated_at: null,
        deleted_at: null,
        comment_count: 0,
        like_count: 0,
        bookmark_count: 0,
        view_count: 0,
      },
    ],
  );
}

afterEach(() => {
  setDatabaseAdapter(originalAdapter);
});

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

describe("comment service count sync", () => {
  it("increments post comment_count when creating a comment", async () => {
    const adapter = createFakeAdapter();
    setDatabaseAdapter(adapter as unknown as DatabaseAdapter);

    const { data, error } = await createComment({
      content: "first comment",
      postId: 10,
      userId: "user-1",
      startLine: null,
      endLine: null,
    });

    expect(error).toBeNull();
    expect(data?.id).toBe(1);
    expect(adapter.posts[0]?.comment_count).toBe(1);
  });

  it("decrements post comment_count when soft deleting a comment", async () => {
    const adapter = createFakeAdapter();
    setDatabaseAdapter(adapter as unknown as DatabaseAdapter);

    const { data: createdComment } = await createComment({
      content: "first comment",
      postId: 10,
      userId: "user-1",
      startLine: null,
      endLine: null,
    });

    const result = await deleteComment(createdComment!.id);

    expect(result.error).toBeNull();
    expect(adapter.posts[0]?.comment_count).toBe(0);
    expect(adapter.comments[0]?.deleted_at).not.toBeNull();
  });

  it("does not decrement below zero on duplicate soft delete", async () => {
    const adapter = createFakeAdapter();
    setDatabaseAdapter(adapter as unknown as DatabaseAdapter);

    const { data: createdComment } = await createComment({
      content: "first comment",
      postId: 10,
      userId: "user-1",
      startLine: null,
      endLine: null,
    });

    await deleteComment(createdComment!.id);
    await deleteComment(createdComment!.id);

    expect(adapter.posts[0]?.comment_count).toBe(0);
  });
});
