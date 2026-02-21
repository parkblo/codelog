import { getDatabaseAdapter } from "@/shared/lib/database";

export async function exchangeAuthCode(code: string) {
  const db = getDatabaseAdapter();
  const { error } = await db.exchangeCodeForSession(code);
  return { error };
}
