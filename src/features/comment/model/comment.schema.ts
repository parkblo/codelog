import { z } from "zod";

export const commentSchema = z.object({
  content: z.string().min(1, "댓글을 작성해주세요."),
});

export type CommentFormData = z.infer<typeof commentSchema>;
