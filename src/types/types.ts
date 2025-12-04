import { Tables } from "./database.types";

export type UserAuth = Omit<
  Tables<"users">,
  "created_at" | "deleted_at" | "updated_at" | "password" | "bio"
>;

export type Author = Pick<
  Tables<"users">,
  "username" | "nickname" | "avatar" | "bio"
>;

export interface Post extends Omit<Tables<"posts">, "user_id"> {
  author: Author;
  tags: string[];
}
