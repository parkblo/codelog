import { z } from "zod";

export const postSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "짧은 설명을 입력해주세요.")
    .max(200, "짧은 설명은 200자 이하여야 합니다."),
  content: z
    .string()
    .trim()
    .min(1, "게시글 내용을 입력해주세요.")
    .max(5000, "게시글은 5000자 이하여야 합니다."),
  code: z.string().nullable(),
  language: z.string().nullable(),
});

export type PostFormData = z.infer<typeof postSchema>;
