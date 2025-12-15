"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Bookmark, CodeXml, Heart, MessageCircle, Share } from "lucide-react";
import { TagList } from "../ui/tag-list";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CodeSnippet } from "../post/CodeSnippet";

import { Post as PostType, Comment as CommentType } from "@/types/types";
import PostMenu from "@/app/post/[postId]/_components/PostMenu";
import { formatRelativeTime } from "@/utils/date";
import {
  createPostLikeAction,
  deletePostLikeAction,
} from "@/actions/like.action";
import { useState, useMemo } from "react";
import CommentForm from "@/app/post/[postId]/_components/CommentForm";
import {
  createBookmarkAction,
  deleteBookmarkAction,
} from "@/actions/bookmark.action";
import ReviewComment from "@/app/post/[postId]/_components/ReviewComment";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface PostProps {
  post: PostType;
  fullPage?: boolean;
  comments?: CommentType[];
}

export default function Post({ post, fullPage = false, comments }: PostProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);

  const [visibleCommentLines, setVisibleCommentLines] = useState<number[]>([]);

  const toggleCommentLine = (lineNumber: number) => {
    setVisibleCommentLines((prev) =>
      prev.includes(lineNumber)
        ? prev.filter((l) => l !== lineNumber)
        : [...prev, lineNumber]
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
    const previousState = isLiked;
    setIsLiked(!isLiked);

    try {
      const result = isLiked
        ? await deletePostLikeAction(post.id)
        : await createPostLikeAction(post.id);

      // TODO - 에러 핸들링 로직 추후 변경필요
      if (result.error !== null) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      setIsLiked(previousState);
    }
  };

  const handleBookmarkClick = async () => {
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const result = isBookmarked
        ? await deleteBookmarkAction(post.id)
        : await createBookmarkAction(post.id);

      // TODO - 에러 핸들링 로직 추후 변경필요
      if (result.error !== null) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      setIsBookmarked(previousState);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2">
          {/* 작성자 정보 영역 */}
          <div className="flex flex-1 min-w-0 gap-2 justify-between">
            <div className="flex gap-2 items-center">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage
                  src={post.author.avatar || ""}
                  alt={post.author.nickname}
                />
                <AvatarFallback>
                  {post.author.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start">
                <div className="flex gap-1 items-center">
                  <span className="font-medium text-foreground">
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
              !fullPage && "hover:cursor-pointer"
            )}
          >
            {/* 본문 영역 */}
            {post.content && (
              <p
                className="text-foreground whitespace-pre-wrap break-words leading-relaxed"
                onClick={handlePostClick}
              >
                {post.content}
              </p>
            )}

            {/* 코드 영역 */}
            {post.code && (
              <div onClick={handlePostClick}>
                <CodeSnippet
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
                      (c) => c.end_line === lineNumber && c.start_line !== null
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
                      (c) => c.end_line === lineNumber && c.start_line !== null
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
