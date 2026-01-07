/**
 * 북마크 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다.
 */
export interface IBookmarkService {
  /**
   * 특정 게시글을 북마크에 추가합니다.
   * @param postId 게시글 ID
   * @param userId 사용자 UUID
   * @returns 에러 객체 (성공 시 null)
   */
  createBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 특정 게시글의 북마크를 취소합니다.
   * @param postId 게시글 ID
   * @param userId 사용자 UUID
   * @returns 에러 객체 (성공 시 null)
   */
  deleteBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 사용자가 북마크한 모든 게시글 ID 목록을 가져옵니다.
   * @param userId 사용자 UUID
   * @returns 북마크된 게시글 ID 배열과 에러 객체
   */
  getBookmarks(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }>;
}
