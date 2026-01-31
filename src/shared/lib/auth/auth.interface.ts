import { UserAuth } from "@/shared/types/types";

export interface IAuthService {
  getCurrentUser(): Promise<UserAuth | null>;
}
