"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

import { getPostListPageAction } from "@/features/post-list";
import { captureEvent } from "@/shared/lib/posthog";
import { Post } from "@/shared/types";
import { Button } from "@/shared/ui/button";

import PostCard from "./post-card";

type PostListPageOptions = NonNullable<
  Parameters<typeof getPostListPageAction>[0]
>;
type PostListFilterOptions = Omit<PostListPageOptions, "offset" | "limit">;

const DEFAULT_POST_PAGE_SIZE = 10;

interface PostInfiniteListProps {
  initialPosts: Post[];
  initialHasMore: boolean;
  filterOptions?: PostListFilterOptions;
  pageSize?: number;
  emptyState?: ReactNode;
}

export function PostInfiniteList({
  initialPosts,
  initialHasMore,
  filterOptions = {},
  pageSize = DEFAULT_POST_PAGE_SIZE,
  emptyState,
}: PostInfiniteListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [offset, setOffset] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setPosts(initialPosts);
    setOffset(initialPosts.length);
    setHasMore(initialHasMore);
    setError(null);
    setIsLoading(false);
    isFetchingRef.current = false;
  }, [initialHasMore, initialPosts]);

  const loadMorePosts = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: getPostsError, hasMore: nextHasMore } =
        await getPostListPageAction({
          ...filterOptions,
          offset,
          limit: pageSize,
        });

      if (getPostsError || !data) {
        captureEvent("post_list_load_more_failed", {
          offset,
          error_message: getPostsError || "unknown_error",
        });
        setError(getPostsError || "게시글 불러오기에 실패했습니다.");
        return;
      }

      captureEvent("post_list_load_more_succeeded", {
        offset,
        loaded_count: data.length,
        has_more: nextHasMore,
      });

      setPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((post) => post.id));
        const nextPosts = data.filter((post) => !existingPostIds.has(post.id));

        return [...prevPosts, ...nextPosts];
      });
      setOffset((prevOffset) => prevOffset + data.length);
      setHasMore(nextHasMore);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [filterOptions, hasMore, offset, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || error) {
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
  }, [error, hasMore, loadMorePosts]);

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

      {error && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-destructive">{error}</p>
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

      {isLoading && (
        <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>게시글을 불러오는 중...</span>
        </div>
      )}

      {!isLoading && hasMore && <div ref={sentinelRef} className="h-2 w-full" />}
    </div>
  );
}
