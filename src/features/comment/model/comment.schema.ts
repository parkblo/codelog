import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "댓글을 작성해주세요.")
    .max(500, "댓글은 500자 이하여야 합니다."),
});

export type CommentFormData = z.infer<typeof commentSchema>;
