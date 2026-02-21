import { getDatabaseAdapter } from "@/shared/lib/database";
import { UserAuth } from "@/shared/types";

import "server-only";

export async function getCurrentUserAuth(): Promise<UserAuth | null> {
  const db = getDatabaseAdapter();
  const { data: user, error: authError } = await db.getCurrentAuthUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await db.query<UserAuth>(
    {
      table: "users",
      select: "id, username, nickname, avatar, bio",
      filters: [
        { column: "id", value: user.id },
        { column: "deleted_at", operator: "is", value: null },
      ],
    },
    "single",
  );

  if (profileError || !profile) {
    return null;
  }

  return profile as UserAuth;
}
