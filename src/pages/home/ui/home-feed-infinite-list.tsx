"use client";

import { PostInfiniteList } from "@/widgets/post-card";
import { Post } from "@/shared/types";

interface HomeFeedInfiniteListProps {
  initialPosts: Post[];
  initialHasMore: boolean;
}

export function HomeFeedInfiniteList({
  initialPosts,
  initialHasMore,
}: HomeFeedInfiniteListProps) {
  return (
    <PostInfiniteList
      initialPosts={initialPosts}
      initialHasMore={initialHasMore}
    />
  );
}
