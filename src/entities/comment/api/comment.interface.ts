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
