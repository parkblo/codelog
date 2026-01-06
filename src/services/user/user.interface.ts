import { UserAuth } from "@/types/types";

export interface IUserService {
  editUser(
    user: Pick<UserAuth, "id" | "nickname" | "bio" | "avatar">
  ): Promise<{ error: Error | null }>;
}
