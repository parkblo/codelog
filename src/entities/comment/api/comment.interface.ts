import { Comment } from "@/shared/types/types";

/**
 * 댓글 생성을 위한 데이터 전송 객체(DTO)입니다.
 */
export interface CreateCommentDTO {
  /** 댓글 내용 */
  content: string;
  /** 게시글 ID */
  postId: number;
  /** 작성자 UUID */
  userId: string;
  /** 댓글이 가리키는 코드의 시작 줄 번호 (선택 사항) */
  startLine?: number | null;
  /** 댓글이 가리키는 코드의 종료 줄 번호 (선택 사항) */
  endLine?: number | null;
}

export type CommentType = "all" | "general" | "review";

export interface CommentListOptions {
  offset?: number;
  limit?: number;
  type?: CommentType;
}

/**
 * 댓글 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다.
 */
export interface ICommentService {
  /**
   * 새로운 댓글을 작성합니다.
   * @param data 댓글 작성 정보
   * @returns 생성된 댓글 정보와 에러 객체
   */
  createComment(
    data: CreateCommentDTO
  ): Promise<{ data: Comment | null; error: Error | null }>;

  /**
   * 기존 댓글 내용을 수정합니다.
   * @param id 댓글 ID
   * @param data 수정할 댓글 정보 (일부만 가능)
   * @returns 수정된 댓글 정보와 에러 객체
   */
  updateComment(
    id: number,
    data: Partial<CreateCommentDTO>
  ): Promise<{ data: Comment | null; error: Error | null }>;

  /**
   * 댓글을 삭제합니다.
   * @param id 댓글 ID
   * @returns 에러 객체 (성공 시 null)
   */
  deleteComment(id: number): Promise<{ error: Error | null }>;

  /**
   * 특정 게시글에 달린 모든 댓글 목록을 조회합니다.
   * @param postId 게시글 ID
   * @returns 댓글 목록 배열과 에러 객체
   */
  getCommentsByPostId(
    postId: number,
    options?: CommentListOptions
  ): Promise<{ data: Comment[] | null; error: Error | null }>;

  /**
   * 특정 유저가 좋아요한 댓글 ID 목록을 조회합니다.
   * @param userId 유저 ID
   * @returns 댓글 ID 목록과 에러 객체
   */
  getCommentLikesByUser(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }>;

  /**
   * 댓글 작성 대상 게시글이 활성 상태인지 확인합니다.
   * @param postId 게시글 ID
   * @returns 활성 여부와 에러 객체
   */
  isPostAvailable(
    postId: number
  ): Promise<{ data: boolean; error: Error | null }>;
}
