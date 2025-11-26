import { User } from "@/types/types";

export interface AuthCredentials {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface OAuthOptions {
  redirectTo?: string;
  [key: string]: unknown;
}

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  signInWithOAuth?(provider: string, options?: OAuthOptions): Promise<{ error: Error | null }>;
  signInWithPassword?(credentials: AuthCredentials): Promise<{ error: Error | null }>;
  signUp?(credentials: AuthCredentials): Promise<{ error: Error | null }>;
}
