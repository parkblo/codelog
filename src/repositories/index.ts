import { SupabaseUserRepository } from "./supabase/user.repository";
import { UserRepository } from "./user.repository";

export function getUserRepository(): UserRepository {
  return new SupabaseUserRepository();
}
