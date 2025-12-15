"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Bookmark, Heart, MessageCircle, Share } from "lucide-react";
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
import { useState } from "react";
import CommentForm from "@/app/post/[postId]/_components/CommentForm";
import {
  createBookmarkAction,
  deleteBookmarkAction,
} from "@/actions/bookmark.action";

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

            <PostMenu post={post} />
          </div>

          <div
            className={cn(
              "flex flex-col gap-2",
              !fullPage && "hover:cursor-pointer"
            )}
          >
            {/* 본문 영역 */}
            {post.content && (
              <p className="text-foreground" onClick={handlePostClick}>
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
                        className="mx-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                      >
                        <span>💬</span>
                        <span>{count}</span>
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

                    return (
                      <div
                        className="flex flex-col gap-2 mt-2"
                        style={{
                          fontFamily: "var(--font-pretendard), sans-serif",
                        }}
                      >
                        {lineComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-muted/50 rounded-md text-sm p-4 animate-in fade-in zoom-in-95 duration-200"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">
                                {comment.author.nickname}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(comment.created_at)}
                              </span>
                            </div>
                            <p>{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    );
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
