import { Tables } from "./database.types";

export interface User
  extends Omit<
    Tables<"users">,
    "created_at" | "deleted_at" | "updated_at" | "password"
  > {}

export interface Post extends Omit<Tables<"posts">, "user_id"> {
  author: User;
  tags: string[];
}
