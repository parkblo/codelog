import { UserAuth } from "@/types/types";

export interface IUserService {
  /**
   * 사용자 정보를 수정합니다.
   * @param user 사용자 정보
   * @returns 에러
   */
  editUser(
    user: Pick<UserAuth, "id" | "nickname" | "bio" | "avatar">
  ): Promise<{ error: Error | null }>;
  /**
   * username으로 사용자 정보를 가져옵니다.
   * @param username 사용자 이름
   * @returns 사용자 정보와 에러
   */
  getUserByUsername(
    username: string
  ): Promise<{ data: UserAuth | null; error: Error | null }>;
}
