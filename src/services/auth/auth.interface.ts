import { User } from "@/types/types";

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  signInWithOAuth?(provider: string, options?: any): Promise<{ error: any }>;
  signInWithPassword?(credentials: any): Promise<{ error: any }>;
  signUp?(credentials: any): Promise<{ error: any }>;
}
