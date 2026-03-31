"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Loader2, LockKeyhole } from "lucide-react";

import { PostCard } from "@/widgets/post-card";
import { PostDialog } from "@/features/post-interaction";
import {
  getTodayPostListAction,
  hasUserPostedTodayAction,
} from "@/features/post-list";
import { getCurrentLocalDayContext } from "@/shared/lib/date";
import { POST_LIST_QUERY_KEY } from "@/shared/lib/query/post-list-query";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { VerticalMarquee } from "@/shared/ui/vertical-marquee";

function TodaySkeleton() {
  return (
    <Skeleton className="h-52 rounded-3xl" />
  );
}

export function TodaySection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const localDayContext = useMemo(() => getCurrentLocalDayContext(), []);

  const todayGateQuery = useQuery({
    queryKey: [...POST_LIST_QUERY_KEY, "today", "gate", localDayContext],
    queryFn: async () => {
      const result = await hasUserPostedTodayAction(localDayContext);

      if (result.error || result.data === null) {
        throw new Error(result.error || "오늘 작성 여부를 확인할 수 없습니다.");
      }

      return result.data;
    },
  });

  const todayPostsQuery = useQuery({
    queryKey: [...POST_LIST_QUERY_KEY, "today", "preview", localDayContext],
    queryFn: async () => {
      const result = await getTodayPostListAction({
        ...localDayContext,
        offset: 0,
        limit: 10,
      });

      if (result.error || !result.data) {
        throw new Error(result.error || "오늘 게시글을 불러올 수 없습니다.");
      }

      return result.data;
    },
    enabled: todayGateQuery.data === true,
  });

  const hasPostedToday = todayGateQuery.data === true;
  const isLocked = todayGateQuery.data === false;
  const isLoading =
    todayGateQuery.isLoading || (hasPostedToday && todayPostsQuery.isLoading);
  const posts = todayPostsQuery.data ?? [];

  return (
    <section className="space-y-4">
      {isDialogOpen && (
        <PostDialog
          isOpen={isDialogOpen}
          handleClose={() => setIsDialogOpen(false)}
          source="today_locked_overlay"
        />
      )}

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-500/12 p-2 text-emerald-300">
            <CalendarDays className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
            TODAY
          </p>
        </div>

        <Button asChild variant="ghost" className="rounded-full px-3">
          <Link href="/today">
            더보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-linear-to-br from-emerald-500/8 via-transparent to-cyan-500/8">
        {isLoading ? (
          <CardContent className="p-5">
            <TodaySkeleton />
          </CardContent>
        ) : todayGateQuery.isError || todayPostsQuery.isError ? (
          <CardContent className="p-5">
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <Loader2 className="h-4 w-4" />
              오늘 게시글을 불러오지 못했습니다.
            </div>
          </CardContent>
        ) : isLocked ? (
          <div className="relative min-h-[13.5rem] overflow-hidden sm:min-h-[14.5rem]">
            <div className="pointer-events-none absolute inset-x-0 -inset-y-14 opacity-76 blur-[18px]">
              <VerticalMarquee
                className="h-full rounded-none border-none bg-transparent px-4 py-4"
                cardClassName="border-white/8 bg-white/10 shadow-[0_24px_100px_rgba(0,0,0,0.35)]"
                topFadeClassName="h-24 bg-linear-to-b from-slate-950/30 via-slate-950/5 to-transparent"
                bottomFadeClassName="h-24 bg-linear-to-t from-slate-950/30 via-slate-950/5 to-transparent"
                trackClassName="-translate-y-[10%]"
              />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(2,6,23,0.06)_0%,_rgba(2,6,23,0.36)_58%,_rgba(2,6,23,0.62)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(16,185,129,0.12)_0%,_rgba(2,6,23,0.04)_48%,_rgba(34,211,238,0.14)_100%)]" />

            <div className="relative z-10 flex min-h-[13.5rem] items-center justify-center px-6 py-8 text-center sm:min-h-[14.5rem]">
              <button
                type="button"
                className="group max-w-xl cursor-pointer space-y-4 transition-transform duration-200 ease-out hover:scale-[1.035]"
                onClick={() => setIsDialogOpen(true)}
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/90 backdrop-blur-sm transition-transform duration-200 ease-out group-hover:scale-105">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <p className="text-[clamp(0.84rem,1.45vw,1.12rem)] font-semibold leading-[1.24] tracking-[-0.03em] text-white transition-transform duration-200 ease-out group-hover:scale-105">
                  글을 작성하고
                  <br />
                  오늘 올라온 기록을 확인해보세요
                </p>
              </button>
            </div>
          </div>
        ) : (
          <CardContent className="p-5">
            {posts.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 px-6 py-10 text-center text-sm text-muted-foreground">
                아직 오늘 올라온 게시글이 없습니다.
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </section>
  );
}
