"use client";

import { useEffect, useMemo, useRef } from "react";

import { generateContributionData } from "@/shared/lib/utils/date";
import { UserContribution } from "@/shared/types/types";

interface ContributionGraphProps {
  contributions: UserContribution[];
}

export function ContributionGraph({ contributions }: ContributionGraphProps) {
  const allContributions = useMemo(
    () => generateContributionData(contributions),
    [contributions],
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count <= 1) return "bg-emerald-900";
    if (count <= 2) return "bg-emerald-700";
    if (count <= 4) return "bg-emerald-500";
    return "bg-emerald-400";
  };

  return (
    <div className="py-4">
      <div className="flex flex-col gap-3">
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto pb-2 scroll-smooth"
        >
          <div className="grid grid-rows-7 grid-flow-col gap-[2px] w-full min-w-[500px] max-w-[800px]">
            {allContributions.map((day) => (
              <div
                key={day.contribution_date}
                className={`aspect-square rounded-[1px] ${getColorClass(
                  day.post_count,
                )}`}
                title={`${day.contribution_date}: ${day.post_count} posts`}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted-foreground px-1">
          <span>최근 1년간 게시글 작성</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 bg-muted rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-emerald-900 rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-emerald-700 rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-[2px]" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
