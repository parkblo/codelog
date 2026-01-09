"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { shuffleTagsByChunk, getFontSize } from "@/utils/featured-tags";
import { TagData } from "@/types/types";
import { use, useMemo } from "react";

interface FeaturedTagsProps {
  tagsPromise: Promise<{
    data: TagData[] | null;
    error: string | null;
    randomSeed: number;
  }>;
}

export function FeaturedTags({ tagsPromise }: FeaturedTagsProps) {
  const { data: tags, error, randomSeed } = use(tagsPromise);

  const shuffledTags = useMemo(() => {
    if (!tags) return [];
    return shuffleTagsByChunk(tags);
  }, [tags]);

  const rotations = useMemo(() => {
    return shuffledTags.map((_, index) => {
      const seed = (randomSeed + index * 137) % 100;
      return (seed % 8) - 4;
    });
  }, [shuffledTags, randomSeed]);

  if (error || !tags || tags.length === 0) {
    if (error) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          태그를 불러오는 중 오류가 발생했습니다.
        </div>
      );
    }
    return null;
  }

  const counts = tags.map((t) => t.post_count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  return (
    <div className="relative w-full p-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-5 overflow-hidden">
      {shuffledTags.map((tag, index) => {
        const fontSize = getFontSize(tag.post_count, minCount, maxCount);
        const rotation = rotations[index];

        return (
          <Link
            key={tag.name}
            href={`/search?tag=${encodeURIComponent(tag.name)}`}
            className="group transition-all hover:scale-110 duration-200 ease-out"
            style={{
              fontSize: fontSize,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <Badge
              className={cn(
                "px-4 py-1.5 rounded-full cursor-pointer transition-colors border-none",
                "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              )}
              style={{
                fontSize: "inherit",
              }}
            >
              #{tag.name}
              <span className="ml-1.5 text-[0.6em] opacity-50 font-mono group-hover:opacity-100">
                {tag.post_count}
              </span>
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
