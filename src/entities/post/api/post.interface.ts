import { Post } from "@/shared/types/types";

/**
 * 게시글 생성을 위한 데이터 전송 객체(DTO)입니다.
 */
export type CreatePostDTO = Pick<
  Post,
  "author" | "content" | "code" | "language" | "tags" | "is_review_enabled"
>;

/**
 * 게시글 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다.
 */
export interface IPostService {
  /**
   * 새로운 게시글을 작성합니다.
   * @param data 게시글 작성 정보
   * @returns 생성된 게시글 정보와 에러 객체
   */
  createPost(
    data: CreatePostDTO
  ): Promise<{ data: Post | null; error: Error | null }>;

  /**
   * 조건에 맞는 게시글 목록을 조회합니다.
   * @param options 조회 필터 옵션 (isReviewEnabled, authorId, likedByUserId, bookmarkedByUserId, keyword)
   * @returns 게시글 목록 배열과 에러 객체
   */
  getPosts(options?: {
    isReviewEnabled?: boolean;
    authorId?: string;
    likedByUserId?: string;
    bookmarkedByUserId?: string;
    keyword?: string;
    tag?: string;
    offset?: number;
    limit?: number;
  }): Promise<{ data: Post[] | null; error: Error | null }>;

  /**
   * 특정 ID를 가진 게시글 하나를 상세 조회합니다.
   * @param id 게시글 ID
   * @returns 게시글 정보와 에러 객체
   */
  getPostById(id: number): Promise<{ data: Post | null; error: Error | null }>;

  /**
   * 코드 리뷰 댓글(라인 지정 댓글) 개수를 조회합니다.
   * @param postId 게시글 ID
   * @returns 댓글 개수와 에러 객체
   */
  getReviewCommentsCount(
    postId: number
  ): Promise<{ count: number | null; error: Error | null }>;

  /**
   * 게시글을 삭제합니다.
   * @param id 게시글 ID
   * @returns 에러 객체 (성공 시 null)
   */
  deletePost(id: number): Promise<{ error: Error | null }>;

  /**
   * 기존 게시글 내용을 수정합니다.
   * @param id 게시글 ID
   * @param post 수정할 게시글 정보 (일부만 가능)
   * @returns 수정된 게시글 정보와 에러 객체
   */
  updatePost(
    id: number,
    post: Partial<CreatePostDTO>
  ): Promise<{ data: Post | null; error: Error | null }>;
}
