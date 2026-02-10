import { cache } from "react";

import { UserService } from "./user.service";

const userService = new UserService();

export const getUserByUsernameCached = cache(
  async (username: string, currentUserId?: string) => {
    return userService.getUserByUsername(username, currentUserId);
  },
);
