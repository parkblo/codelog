import { Comment } from "@/types/types";
import { formatRelativeTime } from "@/utils/date";
import CommentForm from "./CommentForm";

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
          className="bg-muted/50 rounded-md text-sm p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold">{comment.author.nickname}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p>{comment.content}</p>
        </div>
      ))}
      <CommentForm
        postId={lineComments[0].post_id}
        startLine={lineComments[0].start_line}
        endLine={lineComments[0].end_line}
      />
    </div>
  );
}
