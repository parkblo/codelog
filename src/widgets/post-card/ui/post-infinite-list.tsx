"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getPostListPageAction } from "@/features/post-list";
import { classifyErrorMessage } from "@/shared/lib/monitoring";
import { captureEvent } from "@/shared/lib/posthog";
import { createPostListInfiniteQueryKey } from "@/shared/lib/query/post-list-query";
import { Post } from "@/shared/types";
import { Button } from "@/shared/ui/button";

import PostCard from "./post-card";

type PostListPageOptions = NonNullable<
  Parameters<typeof getPostListPageAction>[0]
>;
type PostListFilterOptions = Omit<PostListPageOptions, "offset" | "limit">;
type PostPageLoader = (options: {
  offset: number;
  limit: number;
}) => Promise<{
  data: Post[] | null;
  error: string | null;
  hasMore: boolean;
}>;

const DEFAULT_POST_PAGE_SIZE = 10;

interface PostInfiniteListProps {
  initialPosts?: Post[];
  initialHasMore?: boolean;
  filterOptions?: PostListFilterOptions;
  pageSize?: number;
  emptyState?: ReactNode;
  loadPageAction?: PostPageLoader;
  queryKey?: readonly unknown[];
}

export function PostInfiniteList({
  initialPosts = [],
  initialHasMore = false,
  filterOptions = {},
  pageSize = DEFAULT_POST_PAGE_SIZE,
  emptyState,
  loadPageAction,
  queryKey: customQueryKey,
}: PostInfiniteListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const queryKey = useMemo(
    () =>
      customQueryKey ??
      createPostListInfiniteQueryKey({ filterOptions, pageSize }),
    [customQueryKey, filterOptions, pageSize],
  );
  const initialData =
    initialPosts.length > 0 || initialHasMore
      ? {
          pages: [
            {
              data: initialPosts,
              hasMore: initialHasMore,
            },
          ],
          pageParams: [0],
        }
      : undefined;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      const fetchPage =
        loadPageAction ??
        ((options: { offset: number; limit: number }) =>
          getPostListPageAction({
            ...filterOptions,
            offset: options.offset,
            limit: options.limit,
          }));
      const {
        data: pageData,
        error: getPostsError,
        hasMore,
      } = await fetchPage({
        offset,
        limit: pageSize,
      });

      if (getPostsError || !pageData) {
        captureEvent("post_list_load_more_failed", {
          offset,
          error_category: classifyErrorMessage(getPostsError),
        });
        throw new Error(getPostsError || "게시글 불러오기에 실패했습니다.");
      }

      captureEvent("post_list_load_more_succeeded", {
        offset,
        loaded_count: pageData.length,
        has_more: hasMore,
      });

      return {
        data: pageData,
        hasMore,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }

      return allPages.reduce(
        (loadedCount, page) => loadedCount + page.data.length,
        0,
      );
    },
    initialData,
  });

  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.data) ?? [];
    const uniquePosts = new Map<number, Post>();

    for (const post of allPosts) {
      uniquePosts.set(post.id, post);
    }

    return Array.from(uniquePosts.values());
  }, [data]);

  const errorMessage = error instanceof Error ? error.message : null;

  const loadMorePosts = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage) {
      return;
    }

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasNextPage || errorMessage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMorePosts();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [errorMessage, hasNextPage, isFetchingNextPage, loadMorePosts]);

  if (posts.length === 0 && !errorMessage && data === undefined) {
    return (
      <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>게시글을 불러오는 중...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      emptyState || (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p>게시글이 없습니다.</p>
        </div>
      )
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} fullPage={false} />
      ))}

      {errorMessage && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button
            variant="outline"
            onClick={() => {
              captureEvent("post_list_load_more_retry_clicked");
              void loadMorePosts();
            }}
          >
            다시 시도
          </Button>
        </div>
      )}

      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>게시글을 불러오는 중...</span>
        </div>
      )}

      {!isFetchingNextPage && hasNextPage && (
        <div ref={sentinelRef} className="h-2 w-full" />
      )}
    </div>
  );
}
