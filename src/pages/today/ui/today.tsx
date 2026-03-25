"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Loader2 } from "lucide-react";

import { PostInfiniteList } from "@/widgets/post-card";
import {
  getTodayPostListAction,
  hasUserPostedTodayAction,
} from "@/features/post-list";
import { getCurrentLocalDayContext } from "@/shared/lib/date";
import {
  captureEvent,
  getTodayExperimentProperties,
  getTodayGateState,
} from "@/shared/lib/posthog";
import { POST_LIST_QUERY_KEY } from "@/shared/lib/query/post-list-query";
import { PageHeader } from "@/shared/ui/page-header";

export function TodayPage() {
  const router = useRouter();
  const localDayContext = useMemo(() => getCurrentLocalDayContext(), []);
  const hasCapturedViewRef = useRef(false);
  const todayGateQuery = useQuery({
    queryKey: [...POST_LIST_QUERY_KEY, "today", "page-gate", localDayContext],
    queryFn: async () => {
      const result = await hasUserPostedTodayAction(localDayContext);

      if (result.error || result.data === null) {
        throw new Error(result.error || "오늘 작성 여부를 확인할 수 없습니다.");
      }

      return result.data;
    },
  });

  useEffect(() => {
    if (todayGateQuery.data === false) {
      router.replace("/home?today=locked");
    }
  }, [router, todayGateQuery.data]);

  useEffect(() => {
    if (
      todayGateQuery.isLoading ||
      todayGateQuery.isError ||
      todayGateQuery.data !== true ||
      hasCapturedViewRef.current
    ) {
      return;
    }

    captureEvent("today_module_viewed", {
      gate_state: getTodayGateState(true),
      path: "/today",
      ...getTodayExperimentProperties(),
    });
    hasCapturedViewRef.current = true;
  }, [todayGateQuery.data, todayGateQuery.isError, todayGateQuery.isLoading]);

  if (todayGateQuery.data === false) {
    return (
      <div className="p-4">
        <PageHeader
          showBackButton
          title="TODAY"
          icon={CalendarDays}
          description="오늘 기록한 개발자들의 글"
        />
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>홈으로 이동하는 중...</span>
        </div>
      </div>
    );
  }

  if (todayGateQuery.isLoading) {
    return (
      <div className="p-4">
        <PageHeader
          showBackButton
          title="TODAY"
          icon={CalendarDays}
          description="오늘 기록한 개발자들의 글"
        />
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>TODAY를 준비하는 중...</span>
        </div>
      </div>
    );
  }

  if (todayGateQuery.isError) {
    return (
      <div className="p-4 space-y-4">
        <PageHeader
          showBackButton
          title="TODAY"
          icon={CalendarDays}
          description="오늘 기록한 개발자들의 글"
        />
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-5 text-sm text-destructive">
          TODAY 피드를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        showBackButton
        title="TODAY"
        icon={CalendarDays}
        description="오늘 기록한 개발자들의 글"
      />

      <PostInfiniteList
        queryKey={[...POST_LIST_QUERY_KEY, "today", "page-feed", localDayContext]}
        loadPageAction={({ offset, limit }) =>
          getTodayPostListAction({
            ...localDayContext,
            offset,
            limit,
          })
        }
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p>오늘 올라온 게시글이 없습니다.</p>
          </div>
        }
      />
    </div>
  );
}
