"use client";

import { useMemo } from "react";

import { PostInfiniteList } from "@/widgets/post-card";
import { getNonTodayPostListPageAction } from "@/features/post-list";
import { getCurrentLocalDayContext } from "@/shared/lib/date";
import { POST_LIST_QUERY_KEY } from "@/shared/lib/query/post-list-query";

export function HomeFeedInfiniteList() {
  const localDayContext = useMemo(() => getCurrentLocalDayContext(), []);

  return (
    <PostInfiniteList
      queryKey={[...POST_LIST_QUERY_KEY, "home", localDayContext]}
      loadPageAction={({ offset, limit }) =>
        getNonTodayPostListPageAction({
          ...localDayContext,
          offset,
          limit,
        })
      }
    />
  );
}
