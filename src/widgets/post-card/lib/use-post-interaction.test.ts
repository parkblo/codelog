import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePostInteraction } from "./use-post-interaction";

const {
  mockUseAuth,
  mockHandleAction,
  mockCreatePostLikeAction,
  mockDeletePostLikeAction,
  mockCreateBookmarkAction,
  mockDeleteBookmarkAction,
} = vi.hoisted(() => {
  return {
    mockUseAuth: vi.fn(),
    mockHandleAction: vi.fn(),
    mockCreatePostLikeAction: vi.fn(),
    mockDeletePostLikeAction: vi.fn(),
    mockCreateBookmarkAction: vi.fn(),
    mockDeleteBookmarkAction: vi.fn(),
  };
});

vi.mock("@/entities/user", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@/shared/lib/posthog", () => ({
  captureEvent: vi.fn(),
}));

vi.mock("@/shared/lib", () => ({
  handleAction: mockHandleAction,
}));

vi.mock("@/entities/like", () => ({
  createPostLikeAction: mockCreatePostLikeAction,
  deletePostLikeAction: mockDeletePostLikeAction,
}));

vi.mock("@/entities/bookmark", () => ({
  createBookmarkAction: mockCreateBookmarkAction,
  deleteBookmarkAction: mockDeleteBookmarkAction,
}));

describe("usePostInteraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      openAuthModal: vi.fn(),
    });

    mockCreatePostLikeAction.mockResolvedValue({ error: null });
    mockDeletePostLikeAction.mockResolvedValue({ error: null });
    mockCreateBookmarkAction.mockResolvedValue({ error: null });
    mockDeleteBookmarkAction.mockResolvedValue({ error: null });

    mockHandleAction.mockImplementation(
      async (
        actionPromise: Promise<{ error: string | null }>,
        options?: { onError?: () => void },
      ) => {
        const result = await actionPromise;
        if (result.error && options?.onError) {
          options.onError();
        }
        return result;
      },
    );
  });

  it("optimistically updates like and bookmark counts", async () => {
    const { result } = renderHook(() =>
      usePostInteraction({
        postId: 10,
        initialIsLiked: false,
        initialLikeCount: 3,
        initialIsBookmarked: false,
        initialBookmarkCount: 2,
      }),
    );

    await act(async () => {
      await result.current.handleLikeClick();
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(4);
    expect(mockCreatePostLikeAction).toHaveBeenCalledWith(10);

    await act(async () => {
      await result.current.handleBookmarkClick();
    });

    expect(result.current.isBookmarked).toBe(true);
    expect(result.current.bookmarkCount).toBe(3);
    expect(mockCreateBookmarkAction).toHaveBeenCalledWith(10);
  });

  it("rolls back like state and count on action error", async () => {
    mockCreatePostLikeAction.mockResolvedValueOnce({ error: "fail" });

    const { result } = renderHook(() =>
      usePostInteraction({
        postId: 12,
        initialIsLiked: false,
        initialLikeCount: 7,
      }),
    );

    await act(async () => {
      await result.current.handleLikeClick();
    });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(7);
  });

  it("syncs local state when server props change", async () => {
    const { result, rerender } = renderHook(
      (props: {
        postId: number;
        initialIsLiked: boolean;
        initialLikeCount: number;
        initialIsBookmarked: boolean;
        initialBookmarkCount: number;
      }) => usePostInteraction(props),
      {
        initialProps: {
          postId: 20,
          initialIsLiked: false,
          initialLikeCount: 1,
          initialIsBookmarked: false,
          initialBookmarkCount: 4,
        },
      },
    );

    rerender({
      postId: 20,
      initialIsLiked: true,
      initialLikeCount: 9,
      initialIsBookmarked: true,
      initialBookmarkCount: 6,
    });

    await waitFor(() => {
      expect(result.current.isLiked).toBe(true);
      expect(result.current.likeCount).toBe(9);
      expect(result.current.isBookmarked).toBe(true);
      expect(result.current.bookmarkCount).toBe(6);
    });
  });

  it("resets local state when postId changes with the same initial props", async () => {
    const { result, rerender } = renderHook(
      (props: {
        postId: number;
        initialIsLiked: boolean;
        initialLikeCount: number;
        initialIsBookmarked: boolean;
        initialBookmarkCount: number;
      }) => usePostInteraction(props),
      {
        initialProps: {
          postId: 30,
          initialIsLiked: false,
          initialLikeCount: 1,
          initialIsBookmarked: false,
          initialBookmarkCount: 4,
        },
      },
    );

    await act(async () => {
      await result.current.handleLikeClick();
      await result.current.handleBookmarkClick();
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(2);
    expect(result.current.isBookmarked).toBe(true);
    expect(result.current.bookmarkCount).toBe(5);

    rerender({
      postId: 31,
      initialIsLiked: false,
      initialLikeCount: 1,
      initialIsBookmarked: false,
      initialBookmarkCount: 4,
    });

    await waitFor(() => {
      expect(result.current.isLiked).toBe(false);
      expect(result.current.likeCount).toBe(1);
      expect(result.current.isBookmarked).toBe(false);
      expect(result.current.bookmarkCount).toBe(4);
    });
  });
});
