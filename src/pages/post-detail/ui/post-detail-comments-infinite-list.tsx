"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

import { CommentItem } from "@/features/comment";
import { getCommentsByPostIdPageAction } from "@/entities/comment";
import { Comment } from "@/shared/types";
import { Button } from "@/shared/ui/button";

const COMMENT_PAGE_SIZE = 10;

interface PostDetailCommentsInfiniteListProps {
  postId: number;
  initialComments: Comment[];
  initialHasMore: boolean;
}

export function PostDetailCommentsInfiniteList({
  postId,
  initialComments,
  initialHasMore,
}: PostDetailCommentsInfiniteListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [offset, setOffset] = useState(initialComments.length);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setComments(initialComments);
    setOffset(initialComments.length);
    setHasMore(initialHasMore);
    setError(null);
    setIsLoading(false);
    isFetchingRef.current = false;
  }, [initialComments, initialHasMore, postId]);

  const loadMoreComments = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const {
        data,
        error: getCommentsError,
        hasMore: nextHasMore,
      } = await getCommentsByPostIdPageAction(postId, {
        offset,
        limit: COMMENT_PAGE_SIZE,
        type: "general",
      });

      if (getCommentsError || !data) {
        setError(getCommentsError || "댓글 불러오기에 실패했습니다.");
        return;
      }

      setComments((prevComments) => {
        const existingCommentIds = new Set(
          prevComments.map((comment) => comment.id),
        );
        const nextComments = data.filter(
          (comment) => !existingCommentIds.has(comment.id),
        );

        return [...prevComments, ...nextComments];
      });
      setOffset((prevOffset) => prevOffset + data.length);
      setHasMore(nextHasMore);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, offset, postId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreComments();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [error, hasMore, loadMoreComments]);

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        <p>아직 댓글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}

      {error && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadMoreComments()}>
            다시 시도
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>댓글을 불러오는 중...</span>
        </div>
      )}

      {!isLoading && hasMore && <div ref={sentinelRef} className="h-2 w-full" />}
    </div>
  );
}
