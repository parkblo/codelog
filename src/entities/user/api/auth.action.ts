"use server";

import { revalidatePath } from "next/cache";

import { AuthCredentials, SignUpProps } from "@/entities/user/api/auth.interface";
import { getDatabaseAdapter } from "@/shared/lib/database";

export async function signInWithPasswordAction(credentials: AuthCredentials) {
  try {
    const db = getDatabaseAdapter();

    if (!credentials.email || !credentials.password) {
      return { error: "이메일과 비밀번호를 입력해주세요." };
    }

    const { error } = await db.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error(error);
      if (error.message === "Invalid login credentials") {
        return { error: "이메일 또는 비밀번호가 일치하지 않습니다." };
      }

      return { error: error.message };
    }

    revalidatePath("/");
    return { error: null, message: "로그인되었습니다." };
  } catch (err) {
    console.error(err);
    return { error: "로그인 중 알 수 없는 오류가 발생했습니다." };
  }
}

export async function signUpAction(credentials: SignUpProps) {
  try {
    const db = getDatabaseAdapter();
    const { email, password, data } = credentials;

    if (!email || !password || !data.user_name || !data.nick_name) {
      return { error: "모든 항목을 입력해주세요." };
    }

    if (password.length < 6) {
      return { error: "비밀번호는 6자 이상이어야 합니다." };
    }

    const { error } = await db.signUp({
      email,
      password,
      options: {
        data: {
          user_name: data.user_name,
          full_name: data.nick_name,
          avatar_url: data.avatar_url,
        },
      },
    });

    if (error) {
      console.error(error);
      return { error: error.message };
    }

    return { error: null, message: "회원가입이 완료되었습니다." };
  } catch (err) {
    console.error(err);
    return { error: "회원가입 중 알 수 없는 오류가 발생했습니다." };
  }
}

export async function signInWithOAuthAction(
  provider: "github",
  options?: { redirectTo: string }
) {
  try {
    const db = getDatabaseAdapter();
    const { data, error } = await db.signInWithOAuth(provider, {
      redirectTo: options?.redirectTo,
    });

    if (error) {
      console.error(error);
      return { error: error.message };
    }

    if (data?.url) {
      return { data: { url: data.url }, error: null };
    }

    return { error: "인증 URL을 생성할 수 없습니다." };
  } catch (err) {
    console.error(err);
    return { error: "OAuth 인증 초기화 실패" };
  }
}

export async function signOutAction() {
  try {
    const db = getDatabaseAdapter();
    const { error } = await db.signOut();

    if (error) {
      console.error(error);
      return { error: error.message };
    }

    revalidatePath("/");
    return { error: null, message: "로그아웃되었습니다." };
  } catch (err) {
    console.error(err);
    return { error: "로그아웃 실패" };
  }
}

export async function getCurrentUserAction() {
  try {
    const db = getDatabaseAdapter();
    const { data, error } = await db.getCurrentAuthUser();

    if (error) {
      console.error(error);
      return { error: error.message };
    }

    return { error: null, data };
  } catch (err) {
    console.error(err);
    return {
      error: "현재 사용자 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}
