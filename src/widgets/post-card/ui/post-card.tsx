"use client";

import { useRouter } from "next/navigation";

import { cn, renderContent } from "@/shared/lib";
import { captureEvent } from "@/shared/lib/posthog";
import { Comment as CommentType, Post as PostType } from "@/shared/types";
import { Card, CardContent } from "@/shared/ui/card";
import { TagList } from "@/shared/ui/tag-list";

import { usePostInteraction } from "../lib/use-post-interaction";

import { PostActions } from "./post-actions";
import { PostCodeSection } from "./post-code-section";
import { PostHeader } from "./post-header";

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
  const router = useRouter();
  const { isLiked, isBookmarked, handleLikeClick, handleBookmarkClick } =
    usePostInteraction({
      postId: post.id,
      initialIsLiked: post.is_liked,
      initialIsBookmarked: post.is_bookmarked,
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
            {post.content && (
              <p
                className="text-foreground whitespace-pre-wrap wrap-break-word leading-relaxed"
                onClick={handlePostClick}
              >
                {renderContent(post.content, fullPage)}
              </p>
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
            likeCount={post.like_count}
            commentCount={post.comment_count}
            bookmarkCount={post.bookmark_count}
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
