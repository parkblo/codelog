"use client";

import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeSnippetProps {
  code: string;
  language: string;
  readOnly?: boolean;
}

export function CodeSnippet({
  code,
  language,
  readOnly = false,
}: CodeSnippetProps) {
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartLine, setDragStartLine] = useState<number | null>(null);

  const handleMouseDown = (lineNumber: number) => {
    if (readOnly) return;

    // 이미 선택된 라인이 있는 경우 선택 해제로 작동 (TOGGLE)
    if (selectedLines.length >= 1) {
      setSelectedLines([]);
      setDragStartLine(null);
      return;
    }

    setIsDragging(true);
    setDragStartLine(lineNumber);
    setSelectedLines([lineNumber]);
  };

  const handleMouseEnter = (lineNumber: number) => {
    if (readOnly) return;
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
    if (readOnly) return;
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
                    "flex w-full transition-colors select-none",
                    !readOnly && "cursor-pointer hover:bg-white/5",
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
