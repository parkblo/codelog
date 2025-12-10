"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Bookmark, Heart, MessageCircle, Share } from "lucide-react";
import { TagList } from "../ui/tag-list";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CodeEditor } from "../ui/code-editor";

import { Post as PostType } from "@/types/types";
import PostMenu from "@/app/post/[postId]/_components/PostMenu";
import { formatRelativeTime } from "@/utils/date";

interface PostProps {
  post: PostType;
  fullPage?: boolean;
}

export default function Post({ post, fullPage = false }: PostProps) {
  const router = useRouter();

  const handlePostClick = () => {
    if (!fullPage) {
      router.push(`/post/${post.id}`);
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
              <CodeEditor
                code={post.code || ""}
                language={post.language || "text"}
                readOnly={true}
              />
            )}
          </div>

          {/* 태그 영역 */}
          {post.tags && <TagList tags={post.tags} className="pb-2" />}

          {/* 소셜 인터랙션 영역*/}
          <div className="flex gap-4 border-t pt-2 justify-between">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
            >
              <Heart className="w-4 h-4" />
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
            >
              <Bookmark className="w-4 h-4" />
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
