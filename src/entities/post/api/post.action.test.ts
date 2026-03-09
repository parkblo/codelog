import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createPostMock,
  deletePostMock,
  getCurrentUserAuthMock,
  getPostByIdMock,
  getReviewCommentsCountMock,
  revalidatePathMock,
  updatePostMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  getCurrentUserAuthMock: vi.fn(),
  createPostMock: vi.fn(),
  getPostByIdMock: vi.fn(),
  getReviewCommentsCountMock: vi.fn(),
  updatePostMock: vi.fn(),
  deletePostMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/shared/lib/supabase/current-user", () => ({
  getCurrentUserAuth: getCurrentUserAuthMock,
}));

vi.mock("@/entities/post/api/post.service", () => ({
  createPost: createPostMock,
  getPostById: getPostByIdMock,
  getReviewCommentsCount: getReviewCommentsCountMock,
  updatePost: updatePostMock,
  deletePost: deletePostMock,
}));

import { createPostAction, updatePostAction } from "./post.action";

describe("post.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createPostAction은 서버 세션 유저를 author로 강제한다", async () => {
    const user = {
      id: "server-user",
      username: "server_user",
      nickname: "Server User",
      avatar: "",
      bio: "",
    };
    getCurrentUserAuthMock.mockResolvedValue(user);
    createPostMock.mockResolvedValue({
      data: { id: 10, author: user },
      error: null,
    });

    const result = await createPostAction({
      author: {
        id: "client-user",
        username: "client_user",
        nickname: "Client User",
        avatar: "",
        bio: "",
      },
      content: "content",
      code: "const a = 1;",
      language: "typescript",
      tags: ["ts"],
      is_review_enabled: true,
    });

    expect(result.error).toBeNull();
    expect(createPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        author: user,
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/home");
  });

  it("updatePostAction은 타인 포스트 수정을 차단한다", async () => {
    getCurrentUserAuthMock.mockResolvedValue({
      id: "me",
      username: "me",
    });
    getPostByIdMock.mockResolvedValue({
      data: {
        id: 1,
        code: "original",
        author: { id: "other-user" },
      },
      error: null,
    });

    const result = await updatePostAction(1, { code: "changed" });

    expect(result).toEqual({ error: "본인의 포스트만 수정할 수 있습니다." });
    expect(updatePostMock).not.toHaveBeenCalled();
  });

  it("리뷰 댓글이 존재하면 코드 수정을 차단한다", async () => {
    getCurrentUserAuthMock.mockResolvedValue({
      id: "me",
      username: "me",
    });
    getPostByIdMock.mockResolvedValue({
      data: {
        id: 1,
        code: "original",
        author: { id: "me" },
      },
      error: null,
    });
    getReviewCommentsCountMock.mockResolvedValue({
      count: 2,
      error: null,
    });

    const result = await updatePostAction(1, { code: "changed" });

    expect(result).toEqual({
      error: "코드 리뷰가 존재하는 포스트는 코드를 수정할 수 없습니다.",
    });
    expect(updatePostMock).not.toHaveBeenCalled();
  });
});
