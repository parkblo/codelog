import { User } from "../types/types";

export interface UserRepository {
  getCurrentUser(): Promise<User | null>;
}
