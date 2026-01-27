"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Bookmark, CodeXml, Heart, MessageCircle, Share } from "lucide-react";
import { TagList } from "@/shared/ui/tag-list";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { CodeViewer } from "@/entities/post";

import { Post as PostType, Comment as CommentType } from "@/shared/types/types";
import { PostMenu } from "@/features/post-interaction";
import { formatRelativeTime } from "@/shared/lib/utils/date";
import { createPostLikeAction, deletePostLikeAction } from "@/entities/like";
import { useState, useMemo } from "react";
import { CommentForm } from "@/features/comment";
import {
  createBookmarkAction,
  deleteBookmarkAction,
} from "@/entities/bookmark";
import { ReviewComment } from "@/entities/comment";
import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { handleAction } from "@/shared/lib/utils/handle-action";
import { useAuth } from "@/app/providers/auth-provider";
import { renderContent } from "@/shared/lib/utils/text";

interface PostProps {
  post: PostType;
  fullPage?: boolean;
  comments?: CommentType[];
}

export default function Post({ post, fullPage = false, comments }: PostProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);

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
      // 1. 해당 댓글이 속한 라인이 펼쳐진 상태인지 확인
      if (
        comment.end_line &&
        comment.start_line &&
        visibleCommentLines.includes(comment.end_line)
      ) {
        // 2. 펼쳐져 있다면, 해당 댓글이 가리키는 범위를 모두 하이라이트
        for (let i = comment.start_line; i <= comment.end_line; i++) {
          lines.add(i);
        }
      }
    });

    return Array.from(lines);
  }, [comments, visibleCommentLines]);

  const handlePostClick = () => {
    if (!fullPage) {
      router.push(`/post/${post.id}`);
    }
  };

  const handleLikeClick = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    const previousState = isLiked;
    setIsLiked(!isLiked);

    const action = isLiked
      ? deletePostLikeAction(post.id)
      : createPostLikeAction(post.id);

    await handleAction(action, {
      onError: () => setIsLiked(previousState),
    });
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    const action = isBookmarked
      ? deleteBookmarkAction(post.id)
      : createBookmarkAction(post.id);

    await handleAction(action, {
      onError: () => setIsBookmarked(previousState),
    });
  };

  const handleAuthorClick = () => {
    router.push(`/profile/${post.author.username}`);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2">
          {/* 작성자 정보 영역 */}
          <div className="flex flex-1 min-w-0 gap-2 justify-between">
            <div className="flex gap-2 items-center">
              <Avatar
                className="w-10 h-10 border border-border hover:cursor-pointer"
                onClick={handleAuthorClick}
              >
                <AvatarImage
                  src={post.author.avatar || ""}
                  alt={post.author.nickname}
                />
                <AvatarFallback>
                  {post.author.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start">
                <div
                  className="flex gap-1 items-center hover:cursor-pointer"
                  onClick={handleAuthorClick}
                >
                  <span className="font-medium text-sm text-foreground">
                    {post.author.nickname}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    @{post.author.username}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatRelativeTime(post.created_at)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {post.is_review_enabled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="default">
                      <CodeXml className="w-4 h-4" />
                      Code Review
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>코드 리뷰를 남길 수 있는 게시글입니다.</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <PostMenu post={post} />
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col gap-2",
              !fullPage && "hover:cursor-pointer",
            )}
          >
            {/* 본문 영역 */}
            {post.content && (
              <p
                className="text-foreground whitespace-pre-wrap wrap-break-word leading-relaxed"
                onClick={handlePostClick}
              >
                {renderContent(post.content, fullPage)}
              </p>
            )}

            {/* 코드 영역 */}
            {post.code && (
              <div onClick={handlePostClick}>
                <CodeViewer
                  code={post.code || ""}
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

                    // 펼쳐진 라인이 아니면 렌더링하지 않음
                    if (!visibleCommentLines.includes(lineNumber)) return null;

                    const lineComments = comments.filter(
                      (c) => c.end_line === lineNumber && c.start_line !== null,
                    );

                    if (lineComments.length === 0) return null;

                    return <ReviewComment lineComments={lineComments} />;
                  }}
                />
              </div>
            )}
          </div>

          {/* 태그 영역 */}
          {post.tags && <TagList tags={post.tags} className="pb-2" />}

          {/* 소셜 인터랙션 영역*/}
          <div className="flex gap-4 border-t pt-2 justify-between">
            <Button
              variant="ghost"
              className={
                "text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
              }
              onClick={handleLikeClick}
            >
              <Heart
                className={cn("w-4 h-4", isLiked && "text-red-500")}
                fill={isLiked ? "red" : "none"}
              />
              <span>{post.like_count}</span>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
              onClick={handlePostClick}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count}</span>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
              onClick={handleBookmarkClick}
            >
              <Bookmark
                className={cn("w-4 h-4", isBookmarked && "text-blue-500")}
                fill={isBookmarked ? "#3b82f6" : "none"}
              />
              <span>{post.bookmark_count}</span>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
