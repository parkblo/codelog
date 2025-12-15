import { Comment } from "@/types/types";
import { formatRelativeTime } from "@/utils/date";
import CommentForm from "./CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewCommentProps {
  lineComments: Comment[];
}

export default function ReviewComment({ lineComments }: ReviewCommentProps) {
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
          className="bg-muted/50 rounded-md p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage
                src={comment.author.avatar || ""}
                alt={comment.author.nickname}
              />
              <AvatarFallback>
                {comment.author.nickname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 w-full min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">
                  {comment.author.nickname}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div className="w-full p-2 animate-in fade-in zoom-in-95 duration-200 text-foreground">
        <CommentForm
          postId={lineComments[0].post_id}
          startLine={lineComments[0].start_line}
          endLine={lineComments[0].end_line}
        />
      </div>
    </div>
  );
}
