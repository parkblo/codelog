/**
 * 좋아요(Like) 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다.
 */
export interface ILikeService {
  /**
   * 게시글에 좋아요를 추가합니다.
   * @param postId 게시글 ID
   * @param userId 사용자 UUID
   * @returns 에러 객체 (성공 시 null)
   */
  createPostLike(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 게시글의 좋아요를 취소합니다.
   * @param postId 게시글 ID
   * @param userId 사용자 UUID
   * @returns 에러 객체 (성공 시 null)
   */
  deletePostLike(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 댓글에 좋아요를 추가합니다.
   * @param commentId 댓글 ID
   * @param userId 사용자 UUID
   * @returns 에러 객체 (성공 시 null)
   */
  createCommentLike(
    commentId: number,
    userId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 댓글의 좋아요를 취소합니다.
   * @param commentId 댓글 ID
   * @param userId 사용자 UUID
   * @returns 에러 객체 (성공 시 null)
   */
  deleteCommentLike(
    commentId: number,
    userId: string
  ): Promise<{ error: Error | null }>;

  /**
   * 특정 사용자가 좋아요를 누른 게시글 ID 목록을 조회합니다.
   * @param userId 사용자 UUID
   * @returns 좋아요 누른 게시글 ID 배열과 에러 객체
   */
  getPostLikes(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }>;
}
