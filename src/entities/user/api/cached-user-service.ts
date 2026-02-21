import { cache } from "react";

import { getUserByUsername } from "./user.service";

export const getUserByUsernameCached = cache(
  async (username: string, currentUserId?: string) => {
    return getUserByUsername(username, currentUserId);
  },
);
