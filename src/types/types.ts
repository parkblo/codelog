import { Tables } from "./database.types";

/**
 * 현재 로그인한 유저를 식별하는 정보를 담는 타입
 */
export type UserAuth = Omit<
  Tables<"users">,
  "created_at" | "deleted_at" | "updated_at" | "password"
>;

/**
 * 게시글 작성자를 식별하는 정보를 담는 타입
 */
export type Author = Pick<
  Tables<"users">,
  "username" | "nickname" | "avatar" | "bio" | "id"
> & {
  is_following?: boolean;
};

export interface Post extends Omit<Tables<"posts">, "user_id"> {
  author: Author;
  tags: string[];
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface Comment extends Omit<Tables<"comments">, "user_id"> {
  author: Author;
  is_liked?: boolean;
}

/**
 * 사용자 기여도를 담는 타입
 */
export interface UserContribution {
  contribution_date: string;
  post_count: number;
}
