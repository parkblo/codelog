"use client";

import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeSnippetProps {
  code: string;
  language: string;
  readOnly?: boolean;
  renderSelectionComponent?: (
    startLine: number,
    endLine: number
  ) => React.ReactNode;
  renderLineFooter?: (lineNumber: number) => React.ReactNode;
  renderLineBadge?: (lineNumber: number) => React.ReactNode;
}

export function CodeSnippet({
  code,
  language,
  readOnly = true,
  renderSelectionComponent,
  renderLineFooter,
  renderLineBadge,
}: CodeSnippetProps) {
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartLine, setDragStartLine] = useState<number | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);

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

    setShowCommentForm(false);
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

    setShowCommentForm(true);
  };

  return (
    <div className="rounded-md border bg-[#1e1e1e] overflow-hidden">
      <Highlight theme={themes.vsDark} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(className, "py-2 overflow-x-hidden text-sm")}
            style={{
              ...style,
              fontFamily: '"Fira Code", monospace',
              padding: "0.5rem",
            }}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
          >
            {tokens.map((line, i) => {
              const lineNumber = i + 1;
              const isSelected = selectedLines.includes(lineNumber);

              // 현재 라인이 선택된 라인 중 가장 마지막 라인인지 확인
              const isLastSelected =
                isSelected &&
                selectedLines.length > 0 &&
                Math.max(...selectedLines) === lineNumber;

              return (
                <div key={i} className="flex flex-col">
                  <div
                    {...getLineProps({ line })}
                    onMouseDown={() => handleMouseDown(lineNumber)}
                    onMouseEnter={() => handleMouseEnter(lineNumber)}
                    className={cn(
                      "flex w-full transition-colors select-none items-start",
                      !readOnly && "cursor-pointer hover:bg-white/5",
                      isSelected && "bg-blue-500/20 hover:bg-blue-500/30"
                    )}
                  >
                    <span className="shrink-0 text-right pr-3 pl-2 select-none text-muted-foreground/50 w-[40px] border-r border-border/10">
                      {lineNumber}
                    </span>

                    <span className="pl-3 grow break-all whitespace-pre-wrap">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>

                    {/* 라인 뱃지 (우측 고정 영역) */}
                    {renderLineBadge ? renderLineBadge(lineNumber) : null}
                  </div>
                  {/* 선택된 영역의 마지막 줄 아래에 컴포넌트 렌더링 */}
                  {isLastSelected &&
                    renderSelectionComponent &&
                    showCommentForm && (
                      <div
                        className="w-full p-4 animate-in fade-in zoom-in-95 duration-200 text-foreground"
                        style={{
                          fontFamily: "var(--font-pretendard), sans-serif",
                        }}
                      >
                        {renderSelectionComponent(
                          Math.min(...selectedLines),
                          Math.max(...selectedLines)
                        )}
                      </div>
                    )}
                  {/* 라인 별 Footer 렌더링 (ex: 댓글) */}
                  {renderLineFooter && (
                    <div className="w-full text-foreground">
                      {renderLineFooter(lineNumber)}
                    </div>
                  )}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
