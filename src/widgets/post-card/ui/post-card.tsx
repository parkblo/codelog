"use client";

import { useRouter } from "next/navigation";

import { cn, renderContent } from "@/shared/lib";
import { captureEvent } from "@/shared/lib/posthog";
import { Comment as CommentType, Post as PostType } from "@/shared/types";
import { Card, CardContent } from "@/shared/ui/card";
import { TagList } from "@/shared/ui/tag-list";

import { PostActions } from "./post-actions";
import { PostCodeSection } from "./post-code-section";
import { PostHeader } from "./post-header";
import { usePostInteraction } from "./use-post-interaction";

interface PostCardProps {
  post: PostType;
  fullPage?: boolean;
  comments?: CommentType[];
}

export default function PostCard({
  post,
  fullPage = false,
  comments,
}: PostCardProps) {
  const summary = post.description.trim() || post.content.trim();
  const shouldShowFullContent =
    fullPage && post.content.trim() && post.content.trim() !== summary;
  const router = useRouter();
  const {
    isLiked,
    isBookmarked,
    likeCount,
    bookmarkCount,
    handleLikeClick,
    handleBookmarkClick,
  } = usePostInteraction({
    postId: post.id,
    initialIsLiked: post.is_liked,
    initialIsBookmarked: post.is_bookmarked,
    initialLikeCount: post.like_count,
    initialBookmarkCount: post.bookmark_count,
  });

  const handlePostClick = () => {
    if (!fullPage) {
      captureEvent("post_detail_opened", {
        post_id: post.id,
        source: "post_card",
      });
      router.push(`/post/${post.id}`);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2">
          <PostHeader post={post} />

          <div
            className={cn(
              "flex flex-col gap-2",
              !fullPage && "hover:cursor-pointer",
            )}
          >
            {summary && (
              <div
                className={cn(
                  "relative rounded-3xl border border-border/70 bg-muted/40 px-4 py-3 text-foreground",
                  "before:absolute before:-bottom-2 before:left-6 before:h-4 before:w-4 before:rotate-45 before:rounded-sm before:border-b before:border-r before:border-border/70 before:bg-muted/40 before:content-['']",
                )}
                onClick={handlePostClick}
              >
                <p className="whitespace-pre-wrap break-words leading-relaxed">
                  {renderContent(summary, fullPage)}
                </p>
              </div>
            )}

            {shouldShowFullContent && (
              <div onClick={handlePostClick}>
                <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                  {renderContent(post.content, true)}
                </p>
              </div>
            )}

            <PostCodeSection
              post={post}
              comments={comments}
              fullPage={fullPage}
              onPostClick={handlePostClick}
            />
          </div>

          {post.tags && <TagList tags={post.tags} className="pb-2" />}

          <PostActions
            postId={post.id}
            likeCount={likeCount}
            commentCount={post.comment_count}
            bookmarkCount={bookmarkCount}
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            onLikeClick={handleLikeClick}
            onCommentClick={handlePostClick}
            onBookmarkClick={handleBookmarkClick}
          />
        </div>
      </CardContent>
    </Card>
  );
}
