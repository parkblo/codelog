import { Post } from "@/shared/types/types";

/**
 * 게시글 생성을 위한 데이터 전송 객체(DTO)입니다.
 */
export type CreatePostDTO = Pick<
  Post,
  "author" | "content" | "code" | "language" | "tags" | "is_review_enabled"
>;
