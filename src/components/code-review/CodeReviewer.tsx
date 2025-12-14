"use client";

import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeReviewerProps {
  code: string;
  language: string;
}

export function CodeReviewer({ code, language }: CodeReviewerProps) {
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartLine, setDragStartLine] = useState<number | null>(null);

  const handleMouseDown = (lineNumber: number) => {
    setIsDragging(true);
    setDragStartLine(lineNumber);
    setSelectedLines([lineNumber]);
  };

  const handleMouseEnter = (lineNumber: number) => {
    if (isDragging && dragStartLine !== null) {
      const start = Math.min(dragStartLine, lineNumber);
      const end = Math.max(dragStartLine, lineNumber);
      const newSelection = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
      setSelectedLines(newSelection);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartLine(null);
  };

  return (
    <div className="rounded-md border bg-[#1e1e1e] overflow-hidden">
      <Highlight theme={themes.vsDark} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(className, "py-4 overflow-x-hidden text-sm")}
            style={{ ...style, fontFamily: '"Fira Code", monospace' }}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
          >
            {tokens.map((line, i) => {
              const lineNumber = i + 1;
              const isSelected = selectedLines.includes(lineNumber);

              return (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  onMouseDown={() => handleMouseDown(lineNumber)}
                  onMouseEnter={() => handleMouseEnter(lineNumber)}
                  className={cn(
                    "flex w-full cursor-pointer hover:bg-white/5 transition-colors select-none",
                    isSelected && "bg-blue-500/20 hover:bg-blue-500/30"
                  )}
                >
                  <span className="shrink-0 text-right pr-4 pl-4 select-none text-muted-foreground/50 w-[50px] border-r border-border/10">
                    {lineNumber}
                  </span>
                  <span className="pl-4 grow break-all whitespace-pre-wrap">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
