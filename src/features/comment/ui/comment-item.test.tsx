import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Comment as CommentType } from "@/shared/types/types";

import Comment from "./comment-item";

const {
  mockCreateCommentLikeAction,
  mockDeleteCommentLikeAction,
  mockHandleAction,
} = vi.hoisted(() => {
  return {
    mockCreateCommentLikeAction: vi.fn(),
    mockDeleteCommentLikeAction: vi.fn(),
    mockHandleAction: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/entities/like/api/like.action", () => ({
  createCommentLikeAction: mockCreateCommentLikeAction,
  deleteCommentLikeAction: mockDeleteCommentLikeAction,
}));

vi.mock("@/shared/lib/handle-action", () => ({
  handleAction: mockHandleAction,
}));

vi.mock("@/shared/lib/date", () => ({
  formatRelativeTime: () => "just now",
}));

vi.mock("@/shared/lib/text", () => ({
  renderContent: (content: string) => content,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("Comment item interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateCommentLikeAction.mockResolvedValue({ error: null });
    mockDeleteCommentLikeAction.mockResolvedValue({ error: null });
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

  it("applies optimistic like count update immediately", async () => {
    const action = deferred<{ error: string | null }>();
    mockCreateCommentLikeAction.mockReturnValueOnce(action.promise);
    const comment: CommentType = {
      id: 1,
      post_id: 10,
      content: "test comment",
      created_at: "2026-03-04T00:00:00.000Z",
      like_count: 2,
      is_liked: false,
      author: {
        id: "author-1",
        username: "parkblo",
        nickname: "Park",
        avatar: null,
        bio: null,
      },
      start_line: null,
      end_line: null,
      parent_comment_id: null,
      updated_at: null,
      deleted_at: null,
    };

    const user = userEvent.setup();
    render(<Comment comment={comment} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(screen.getByText("3")).toBeInTheDocument();

    action.resolve({ error: null });
    await waitFor(() => {
      expect(mockHandleAction).toHaveBeenCalled();
    });
  });

  it("rolls back like count when action fails", async () => {
    mockCreateCommentLikeAction.mockResolvedValueOnce({ error: "fail" });
    const comment: CommentType = {
      id: 2,
      post_id: 11,
      content: "rollback test",
      created_at: "2026-03-04T00:00:00.000Z",
      like_count: 5,
      is_liked: false,
      author: {
        id: "author-2",
        username: "parkblo",
        nickname: "Park",
        avatar: null,
        bio: null,
      },
      start_line: null,
      end_line: null,
      parent_comment_id: null,
      updated_at: null,
      deleted_at: null,
    };

    const user = userEvent.setup();
    render(<Comment comment={comment} />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });
});
