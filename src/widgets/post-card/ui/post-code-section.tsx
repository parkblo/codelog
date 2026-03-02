"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { MessageCircle } from "lucide-react";

import { CommentForm, ReviewComment } from "@/features/comment";
import { Comment, Post } from "@/shared/types";
import { Skeleton } from "@/shared/ui/skeleton";

const CodeViewer = dynamic(
  () => import("@/entities/post/ui/code-viewer").then((mod) => mod.CodeSnippet),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-md" />,
  },
);

interface PostCodeSectionProps {
  post: Post;
  comments?: Comment[];
  fullPage: boolean;
  onPostClick: () => void;
}

export function PostCodeSection({
  post,
  comments,
  fullPage,
  onPostClick,
}: PostCodeSectionProps) {
  const [visibleCommentLines, setVisibleCommentLines] = useState<number[]>([]);

  const toggleCommentLine = (lineNumber: number) => {
    setVisibleCommentLines((prev) =>
      prev.includes(lineNumber)
        ? prev.filter((l) => l !== lineNumber)
        : [...prev, lineNumber],
    );
  };

  const highlightedLines = useMemo(() => {
    if (!comments || visibleCommentLines.length === 0) return [];

    const lines = new Set<number>();

    comments.forEach((comment) => {
      if (
        comment.end_line &&
        comment.start_line &&
        visibleCommentLines.includes(comment.end_line)
      ) {
        for (let i = comment.start_line; i <= comment.end_line; i++) {
          lines.add(i);
        }
      }
    });

    return Array.from(lines);
  }, [comments, visibleCommentLines]);

  if (!post.code) return null;

  return (
    <div onClick={onPostClick}>
      <CodeViewer
        code={post.code}
        language={post.language || "text"}
        readOnly={!fullPage || !post.is_review_enabled}
        renderSelectionComponent={(startLine, endLine) => (
          <CommentForm
            postId={post.id}
            startLine={startLine}
            endLine={endLine}
          />
        )}
        highlightedLines={highlightedLines}
        renderLineBadge={(lineNumber) => {
          if (!comments) return null;
          const count = comments.filter(
            (c) => c.end_line === lineNumber && c.start_line !== null,
          ).length;

          if (count === 0) return null;

          return (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggleCommentLine(lineNumber);
              }}
              className="mx-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              type="button"
            >
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{count}</span>
              </div>
            </button>
          );
        }}
        renderLineFooter={(lineNumber) => {
          if (!comments) return null;
          if (!visibleCommentLines.includes(lineNumber)) return null;

          const lineComments = comments.filter(
            (c) => c.end_line === lineNumber && c.start_line !== null,
          );

          if (lineComments.length === 0) return null;

          return <ReviewComment lineComments={lineComments} />;
        }}
      />
    </div>
  );
}
