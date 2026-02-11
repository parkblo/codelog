import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("올바른 이메일 주소를 입력해주세요.")
    .max(100, "이메일은 100자 이하여야 합니다."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .max(32, "비밀번호는 32자 이하여야 합니다.")
    .regex(/^\S+$/, "비밀번호에 공백을 포함할 수 없습니다."),
});

export const signUpSchema = z
  .object({
    email: z
      .email("올바른 이메일 주소를 입력해주세요.")
      .max(100, "이메일은 100자 이하여야 합니다."),
    password: z
      .string()
      .min(6, "비밀번호는 최소 6자 이상이어야 합니다.")
      .max(32, "비밀번호는 32자 이하여야 합니다.")
      .regex(/^\S+$/, "비밀번호에 공백을 포함할 수 없습니다."),
    confirmPassword: z
      .string()
      .min(1, "비밀번호 확인을 입력해주세요.")
      .max(32, "비밀번호는 32자 이하여야 합니다.")
      .regex(/^\S+$/, "비밀번호에 공백을 포함할 수 없습니다."),
    username: z
      .string()
      .min(3, "아이디는 3자 이상이어야 합니다.")
      .max(20, "아이디는 20자 이하여야 합니다.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.",
      ),
    nickname: z
      .string()
      .min(2, "닉네임은 2자 이상이어야 합니다.")
      .max(10, "닉네임은 10자 이하여야 합니다.")
      .regex(/^\S+$/, "닉네임에 공백을 포함할 수 없습니다."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
