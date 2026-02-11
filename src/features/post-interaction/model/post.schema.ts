import { z } from "zod";

export const postSchema = z.object({
  content: z.string().min(1, "게시글 내용을 입력해주세요."),
  code: z.string().nullable(),
  language: z.string().nullable(),
  isReviewEnabled: z.boolean(),
});

export type PostFormData = z.infer<typeof postSchema>;
