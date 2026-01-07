import { Tables } from "@/types/database.types";

/**
 * 태그 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다.
 */
export interface ITagService {
  /**
   * 게시글에 태그를 생성하고 연결합니다.
   * @param tagName 태그 이름
   * @param postId 게시글 ID
   * @returns 생성된 posttags 데이터와 에러 객체
   */
  createTagForPost(
    tagName: string,
    postId: number
  ): Promise<{ data: Tables<"posttags"> | null; error: Error | null }>;

  /**
   * 현재 인기 있는 트렌딩 태그 목록을 가져옵니다.
   * @param limit 가져올 태그 수 제한
   * @returns 태그 이름과 게시글 수를 포함한 배열과 에러 객체
   */
  getTrendingTags(limit: number): Promise<{
    data: { name: string; post_count: number }[] | null;
    error: Error | null;
  }>;
}
