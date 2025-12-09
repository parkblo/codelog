import { UserAuth } from "@/types/types";

export interface AuthCredentials {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface OAuthOptions {
  redirectTo?: string;
  [key: string]: unknown;
}

export interface SignUpProps extends AuthCredentials {
  data: {
    user_name: string;
    nick_name: string;
    avatar_url: string;
    [key: string]: unknown;
  };
}

export interface IAuthService {
  getCurrentUser(): Promise<UserAuth | null>;
  signInWithOAuth?(
    provider: string,
    options?: OAuthOptions
  ): Promise<{ error: Error | null }>;
  signInWithPassword?(
    credentials: AuthCredentials
  ): Promise<{ error: Error | null }>;
  signUp?(credentials: SignUpProps): Promise<{ error: Error | null }>;
  signOut?(): Promise<{ error: Error | null }>;
}
