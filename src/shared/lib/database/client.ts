import type { Provider } from "@supabase/supabase-js";

import { createClient } from "@/shared/lib/supabase/client";
import type { UserAuth } from "@/shared/types";

import type {
  AuthSignUpPayload,
  MutationResult,
  OAuthProvider,
  OAuthSignInOptions,
  QueryResult,
} from "./types";

const USER_PROFILE_SELECT = "id, username, nickname, avatar, bio";

function toError(error: unknown): Error | null {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return new Error(String(error.message));
  }

  return new Error("알 수 없는 데이터베이스 오류가 발생했습니다.");
}

export async function getUserProfileById(
  userId: string,
): Promise<QueryResult<UserAuth>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select(USER_PROFILE_SELECT)
      .eq("id", userId)
      .is("deleted_at", null)
      .single();

    return {
      data: (data as UserAuth | null) ?? null,
      error: toError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: toError(error),
    };
  }
}

export async function getCurrentAuthUserProfile(): Promise<QueryResult<UserAuth>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: toError(error),
      };
    }

    return getUserProfileById(user.id);
  } catch (error) {
    return {
      data: null,
      error: toError(error),
    };
  }
}

export function subscribeToAuthStateChanges(
  onUserIdChange: (userId: string | null) => void,
) {
  const supabase = createClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    onUserIdChange(session?.user?.id ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signInWithOAuthFromClient(
  provider: OAuthProvider,
  options?: OAuthSignInOptions,
): Promise<QueryResult<{ url: string | null }>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options,
    });

    return {
      data: { url: data.url ?? null },
      error: toError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: toError(error),
    };
  }
}

export async function signInWithPasswordFromClient(credentials: {
  email: string;
  password: string;
}): Promise<MutationResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(credentials);
    return { error: toError(error) };
  } catch (error) {
    return { error: toError(error) };
  }
}

export async function signUpFromClient(
  payload: AuthSignUpPayload,
): Promise<MutationResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp(payload);
    return { error: toError(error) };
  } catch (error) {
    return { error: toError(error) };
  }
}

export async function signOutFromClient(): Promise<MutationResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    return { error: toError(error) };
  } catch (error) {
    return { error: toError(error) };
  }
}
