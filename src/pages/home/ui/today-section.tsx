"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, LockKeyhole, Sparkles } from "lucide-react";

import { PostCard } from "@/widgets/post-card";
import { PostDialog } from "@/features/post-interaction";
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
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

function TodaySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-52 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export function TodaySection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogOpenedAtMs, setDialogOpenedAtMs] = useState<number | null>(null);
  const localDayContext = useMemo(() => getCurrentLocalDayContext(), []);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasCapturedViewRef = useRef(false);

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
  });

  const isLoading = todayGateQuery.isLoading || todayPostsQuery.isLoading;
  const hasPostedToday = todayGateQuery.data ?? false;
  const posts = todayPostsQuery.data ?? [];
  const gateState = getTodayGateState(hasPostedToday);

  useEffect(() => {
    if (
      isLoading ||
      todayGateQuery.isError ||
      hasCapturedViewRef.current ||
      !sectionRef.current
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || hasCapturedViewRef.current) {
          return;
        }

        captureEvent("today_module_viewed", {
          gate_state: gateState,
          path: "/home",
          ...getTodayExperimentProperties(),
        });
        hasCapturedViewRef.current = true;
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [gateState, isLoading, todayGateQuery.isError]);

  return (
    <>
      {isDialogOpen && (
        <PostDialog
          isOpen={isDialogOpen}
          handleClose={() => setIsDialogOpen(false)}
          openedAtMs={dialogOpenedAtMs}
          source="today_locked_overlay"
        />
      )}

      <section ref={sectionRef} className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-500/12 p-2 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">
                TODAY
              </p>
              <p className="text-sm text-muted-foreground">
                오늘의 기록은 오늘 참여한 사람에게 먼저 열립니다.
              </p>
            </div>
          </div>

          <Button asChild variant="ghost" className="rounded-full px-3">
            <Link
              href="/today"
              onClick={() => {
                captureEvent("today_cta_clicked", {
                  gate_state: gateState,
                  source: "today_section_more",
                  ...getTodayExperimentProperties(),
                });
              }}
            >
              더보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-linear-to-br from-emerald-500/8 via-transparent to-cyan-500/8">
          <CardContent className="p-5">
            {isLoading ? (
              <TodaySkeleton />
            ) : todayPostsQuery.isError ? (
              <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <Loader2 className="h-4 w-4" />
                오늘 게시글을 불러오지 못했습니다.
              </div>
            ) : (
              <div className="relative">
                <div
                  className={hasPostedToday ? "space-y-4" : "pointer-events-none select-none space-y-4 blur-[6px]"}
                >
                  {posts.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-white/10 px-6 py-10 text-center text-sm text-muted-foreground">
                      아직 오늘 올라온 게시글이 없습니다.
                    </div>
                  )}
                </div>

                {!hasPostedToday && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[1.75rem] border border-white/10 bg-background/92 px-6 py-6 text-center shadow-2xl backdrop-blur">
                      <div className="rounded-full bg-emerald-500/12 p-3 text-emerald-400">
                        <LockKeyhole className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">
                          오늘의 배움을 기록하고, 다른 개발자의 기록을 확인해보세요
                        </p>
                        <p className="text-sm text-muted-foreground">
                          TODAY는 오늘 글을 남긴 뒤에 열립니다.
                        </p>
                      </div>
                      <Button
                        className="rounded-full px-5"
                        onClick={() => {
                          captureEvent("today_cta_clicked", {
                            gate_state: gateState,
                            source: "today_locked_overlay",
                            ...getTodayExperimentProperties(),
                          });
                          setDialogOpenedAtMs(performance.now());
                          captureEvent("post_dialog_opened", {
                            source: "today_locked_overlay",
                            ...getTodayExperimentProperties(),
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        기록하러 가기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
