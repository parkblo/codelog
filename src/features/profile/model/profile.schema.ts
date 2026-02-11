import { z } from "zod";

export const profileSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  bio: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
