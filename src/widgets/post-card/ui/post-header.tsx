import Link from "next/link";

import { Bot, PencilLine } from "lucide-react";

import { PostMenu } from "@/features/post-interaction";
import { UserAvatar } from "@/entities/user";
import { AUTHORING_MODE_LABELS } from "@/shared/lib";
import { formatRelativeTime } from "@/shared/lib";
import { Post } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <div className="flex flex-1 min-w-0 gap-2 justify-between">
      <div className="flex gap-2 items-center">
        <Link href={`/profile/${post.author.username}`} prefetch={false}>
          <UserAvatar user={post.author} />
        </Link>
        <div className="flex flex-col justify-start">
          <Link
            href={`/profile/${post.author.username}`}
            prefetch={false}
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
        <Badge variant="secondary">
          {post.authoring_mode === "ai_assisted" ? (
            <Bot className="w-4 h-4" />
          ) : (
            <PencilLine className="w-4 h-4" />
          )}
          {AUTHORING_MODE_LABELS[post.authoring_mode]}
        </Badge>
        <PostMenu post={post} />
      </div>
    </div>
  );
}
