import { UserAuth, UserContribution } from "@/types/types";

export interface IUserService {
  /**
   * 사용자 정보를 수정합니다.
   * @param user 수정할 사용자 정보 (id, nickname, bio, avatar)
   * @returns 에러 객체 (성공 시 null)
   */
  editUser(
    user: Pick<UserAuth, "id" | "nickname" | "bio" | "avatar">
  ): Promise<{ error: Error | null }>;

  /**
   * 사용자 이름을 기반으로 사용자 정보를 조회합니다.
   * @param username 조회할 사용자의 고유 ID (username)
   * @returns 사용자 정보와 에러 객체
   */
  getUserByUsername(
    username: string
  ): Promise<{ data: UserAuth | null; error: Error | null }>;

  /**
   * 사용자의 기여도(게시글 작성 수) 데이터를 가져옵니다.
   * @param userId 사용자의 UUID
   * @returns 기여도 배열과 에러 객체
   */
  getUserContributions(
    userId: string
  ): Promise<{ data: UserContribution[] | null; error: Error | null }>;

  /**
   * 사용자의 아바타 URL을 업데이트합니다.
   * @param id 사용자의 UUID
   * @param avatarUrl 새로운 아바타 이미지 URL
   * @returns 에러 객체 (성공 시 null)
   */
  updateAvatar(id: string, avatarUrl: string): Promise<{ error: Error | null }>;

  /**
   * 랜덤하게 추천 사용자를 가져옵니다.
   * @param count 가져올 사용자 수
   * @returns 추천 사용자 목록과 에러 객체
   */
  getRandomFeaturedUsers(count: number): Promise<{
    data:
      | Pick<UserAuth, "id" | "username" | "nickname" | "bio" | "avatar">[]
      | null;
    error: Error | null;
  }>;
}

/**
 * 브라우저 환경에서 실행되는 사용자 관련 서비스 인터페이스입니다.
 */
export interface IUserServiceBrowser {
  /**
   * 사용자의 아바타 이미지를 저장소에 업로드합니다.
   * @param userId 사용자의 UUID
   * @param file 업로드할 이미지 파일
   * @returns 업로드된 공용 URL과 에러 메시지
   */
  uploadAvatar(
    userId: string,
    file: File
  ): Promise<{ data: string | null; error: string | null }>;
}
