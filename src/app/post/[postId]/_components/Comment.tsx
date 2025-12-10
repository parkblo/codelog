import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Comment as CommentType } from "@/types/types";
import { formatRelativeTime } from "@/utils/date";
import { Heart } from "lucide-react";

interface commentProps {
  comment: CommentType;
}

export default function Comment({ comment }: commentProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex gap-2">
          <Avatar className="w-10 h-10 border border-border">
            {comment.author && (
              <>
                <AvatarImage
                  src={comment.author.avatar || ""}
                  alt={comment.author.nickname}
                />
                <AvatarFallback>
                  {comment.author.nickname
                    ? comment.author.nickname.charAt(0)
                    : ""}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="flex flex-col">
            <div className="flex gap-2 items-center">
              <span className="text-foreground">{comment.author.nickname}</span>
              <span className="text-muted-foreground text-sm">
                @{comment.author.username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {formatRelativeTime(comment.created_at || "")}
              </span>
            </div>
            <p className="text-foreground">{comment.content}</p>
            <div className="flex gap-4 pt-2 justify-start">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
              >
                <Heart className="w-4 h-4" />
                <span>{comment.like_count}</span>
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
              >
                <span>답글</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
