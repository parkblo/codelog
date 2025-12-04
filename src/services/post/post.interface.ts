import { Post } from "@/types/types";

export type CreatePostDTO = Pick<
  Post,
  "author" | "content" | "code" | "language" | "tags"
>;

export interface IPostService {
  createPost(
    data: CreatePostDTO
  ): Promise<{ data: Post | null; error: Error | null }>;
  getPosts(): Promise<{ data: Post[] | null; error: Error | null }>;
  getPostById(id: number): Promise<{ data: Post | null; error: Error | null }>;
  deletePost(id: number): Promise<{ error: Error | null }>;
  updatePost(
    id: number,
    post: Partial<CreatePostDTO>
  ): Promise<{ data: Post | null; error: Error | null }>;
}
