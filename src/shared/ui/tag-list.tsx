import React from "react";
import Link from "next/link";

import { X } from "lucide-react";

import { cn } from "@/shared/lib";
import { Badge } from "@/shared/ui/badge";

interface TagListProps {
  tags: string[];
  className?: string;
  onDelete?: (tag: string) => void;
}

export function TagList({ tags, className, onDelete }: TagListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => {
        const badge = (
          <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-colors">
            #{tag}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tag);
                }}
                type="button"
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="w-3 h-3" />
                <span className="sr-only">Delete {tag}</span>
              </button>
            )}
          </Badge>
        );

        if (onDelete) {
          return <React.Fragment key={tag}>{badge}</React.Fragment>;
        }

        return (
          <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}>
            {badge}
          </Link>
        );
      })}
    </div>
  );
}
