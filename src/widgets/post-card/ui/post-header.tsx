import Link from "next/link";

import { CodeXml } from "lucide-react";

import { PostMenu } from "@/features/post-interaction";
import { UserAvatar } from "@/entities/user";
import { formatRelativeTime } from "@/shared/lib";
import { Post } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <div className="flex flex-1 min-w-0 gap-2 justify-between">
      <div className="flex gap-2 items-center">
        <Link href={`/profile/${post.author.username}`}>
          <UserAvatar user={post.author} />
        </Link>
        <div className="flex flex-col justify-start">
          <Link
            href={`/profile/${post.author.username}`}
            className="flex gap-1 items-center hover:cursor-pointer"
          >
            <span className="font-medium text-sm text-foreground">
              {post.author.nickname}
            </span>
            <span className="text-sm text-muted-foreground">
              @{post.author.username}
            </span>
          </Link>
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
  );
}
