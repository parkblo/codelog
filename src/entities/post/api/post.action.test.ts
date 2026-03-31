import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createPostMock,
  deletePostMock,
  getCurrentUserAuthMock,
  getPostByIdMock,
  getReviewCommentsCountMock,
  hasUserPostedOnLocalDayMock,
  revalidatePathMock,
  updatePostMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  getCurrentUserAuthMock: vi.fn(),
  createPostMock: vi.fn(),
  getPostByIdMock: vi.fn(),
  getReviewCommentsCountMock: vi.fn(),
  hasUserPostedOnLocalDayMock: vi.fn(),
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
  hasUserPostedOnLocalDay: hasUserPostedOnLocalDayMock,
  updatePost: updatePostMock,
  deletePost: deletePostMock,
}));

import { createPostAction, updatePostAction } from "./post.action";

describe("post.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasUserPostedOnLocalDayMock.mockResolvedValue({
      data: false,
      error: null,
    });
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
      description: "description",
      code: "const a = 1;",
      language: "typescript",
      authoring_mode: "hand_written",
      tags: ["ts"],
      localDayContext: {
        dayKey: "2026-03-25",
        dayStartAt: "2026-03-24T15:00:00.000Z",
        dayEndAt: "2026-03-25T14:59:59.999Z",
        timezoneOffsetMinutes: -540,
      },
    });

    expect(result.error).toBeNull();
    expect(hasUserPostedOnLocalDayMock).toHaveBeenCalledWith({
      dayKey: "2026-03-25",
      dayStartAt: "2026-03-24T15:00:00.000Z",
      dayEndAt: "2026-03-25T14:59:59.999Z",
      timezoneOffsetMinutes: -540,
      userId: "server-user",
    });
    expect(createPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        author: user,
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/home");
  });

  it("createPostAction은 오늘 이미 작성한 경우 생성을 차단한다", async () => {
    getCurrentUserAuthMock.mockResolvedValue({
      id: "server-user",
      username: "server_user",
    });
    hasUserPostedOnLocalDayMock.mockResolvedValue({
      data: true,
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
      description: "description",
      code: null,
      language: null,
      authoring_mode: "hand_written",
      tags: [],
      localDayContext: {
        dayKey: "2026-03-25",
        dayStartAt: "2026-03-24T15:00:00.000Z",
        dayEndAt: "2026-03-25T14:59:59.999Z",
        timezoneOffsetMinutes: -540,
      },
    });

    expect(result).toEqual({ error: "오늘은 이미 글을 작성했습니다." });
    expect(createPostMock).not.toHaveBeenCalled();
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

  it("인라인 코멘트가 존재하면 코드 수정을 차단한다", async () => {
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
      error: "인라인 코멘트가 존재하는 포스트는 코드를 수정할 수 없습니다.",
    });
    expect(updatePostMock).not.toHaveBeenCalled();
  });
});
