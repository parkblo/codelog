import { getCurrentUserAuth } from "@/shared/lib/supabase/current-user";

export async function getCurrentUser() {
  return getCurrentUserAuth();
}
