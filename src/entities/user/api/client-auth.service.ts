import {
  getCurrentAuthUserProfile,
  signInWithOAuthFromClient,
  signInWithPasswordFromClient,
  signOutFromClient,
  signUpFromClient,
} from "@/shared/lib/database/client";
import { UserAuth } from "@/shared/types/types";

import { AuthCredentials, OAuthOptions, SignUpProps } from "./auth.interface";

export async function getCurrentUserFromClient(): Promise<UserAuth | null> {
  const { data } = await getCurrentAuthUserProfile();
  return data;
}

export async function signInWithOAuth(
  provider: "github",
  options?: OAuthOptions,
) {
  return signInWithOAuthFromClient(provider, options);
}

export async function signInWithPassword(credentials: AuthCredentials) {
  return signInWithPasswordFromClient(credentials);
}

export async function signUp(credentials: SignUpProps) {
  const { email, password, data } = credentials;

  return signUpFromClient({
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
}

export async function signOut(): Promise<{ error: Error | null }> {
  return signOutFromClient();
}
