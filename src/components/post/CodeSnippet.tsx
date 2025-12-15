import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

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
  highlightedLines?: number[];
}

export function CodeSnippet({
  code,
  language,
  readOnly = true,
  renderSelectionComponent,
  renderLineFooter,
  renderLineBadge,
  highlightedLines = [],
}: CodeSnippetProps) {
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartLine, setDragStartLine] = useState<number | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  const handleMouseDown = (lineNumber: number) => {
    if (readOnly) return;

    // 1. 이미 선택된 라인을 다시 클릭
    if (selectedLines.includes(lineNumber)) {
      // 1-1. 이미 확정된 상태(폼이 열린 상태)에서 클릭 -> 취소 (Deselect)
      if (showCommentForm) {
        setSelectedLines([]);
        setDragStartLine(null);
        setShowCommentForm(false);
        return;
      }

      // 1-2. 아직 확정 전(폼이 닫힌 상태)에서 클릭 -> 확정 (Confirm Single Line)
      // (단, 한 줄 선택일 때만 유효. 구간 선택 중 내부 클릭은 범위 재설정으로 간주)
      if (selectedLines.length === 1 && selectedLines[0] === lineNumber) {
        setShowCommentForm(true);
        return;
      }

      // 1-3. 구간 선택 중 내부 클릭 (확정 전) -> 해당 라인 하나만 선택으로 변경
      setSelectedLines([lineNumber]);
      setDragStartLine(lineNumber);
      setIsDragging(true);
      setShowCommentForm(false);
      return;
    }

    // 2. 이미 하나만 선택된 상태라면 -> 구간 선택 완성 (Confirm Range)
    // 단, 드래그 중이 아니어야 함
    if (selectedLines.length === 1 && !isDragging) {
      const start = Math.min(selectedLines[0], lineNumber);
      const end = Math.max(selectedLines[0], lineNumber);
      const newSelection = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
      setSelectedLines(newSelection);
      setDragStartLine(null);
      setShowCommentForm(true); // 입력창 표시 (구간은 즉시 확정)
      return;
    }

    // 3. 그 외 -> 새로운 선택 시작 (Pending)
    setIsDragging(true);
    setDragStartLine(lineNumber);
    setSelectedLines([lineNumber]);

    // 첫 클릭 시에는 입력창 숨김 (두 번째 클릭으로 확정 유도)
    setShowCommentForm(false);
  };

  const handleMouseEnter = (lineNumber: number) => {
    if (readOnly) return;
    setHoveredLine(lineNumber);

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

    // 드래그가 끝났을 때: 여러 줄이 선택된 상태라면 -> 입력창 표시
    if (selectedLines.length > 1) {
      setShowCommentForm(true);
    }
  };

  return (
    <div
      className="rounded-md border bg-[#1e1e1e] overflow-hidden"
      onMouseLeave={() => setHoveredLine(null)}
    >
      {/* Code Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {language}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

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

              // 프리뷰 표시: 하나만 선택된 상태에서 다른 곳을 호버하면 구간 미리보기
              let effectiveSelectedLines = selectedLines;

              if (
                selectedLines.length === 1 &&
                hoveredLine !== null &&
                hoveredLine !== selectedLines[0] &&
                !readOnly
              ) {
                const start = Math.min(selectedLines[0], hoveredLine);
                const end = Math.max(selectedLines[0], hoveredLine);
                effectiveSelectedLines = Array.from(
                  { length: end - start + 1 },
                  (_, i) => start + i
                );
              }

              const isSelected = effectiveSelectedLines.includes(lineNumber);

              // 현재 라인이 선택된 라인 중 가장 마지막 라인인지 확인
              const isLastSelected =
                selectedLines.includes(lineNumber) &&
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
                      isSelected && "bg-blue-500/20 hover:bg-blue-500/30",
                      !isSelected &&
                        highlightedLines.includes(lineNumber) &&
                        "bg-yellow-500/10"
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
