import { z } from "zod";

export const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(10, "닉네임은 10자 이하여야 합니다.")
    .regex(/^\S+$/, "닉네임에 공백을 포함할 수 없습니다."),
  bio: z.string().max(160, "소개글은 160자 이하여야 합니다.").optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
