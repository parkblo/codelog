import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const signUpSchema = z
  .object({
    email: z.email("올바른 이메일 주소를 입력해주세요."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    username: z.string().min(1, "사용자 이름을 입력해주세요."),
    nickname: z.string().min(1, "닉네임을 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
