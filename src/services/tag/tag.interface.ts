import { Tables } from "@/types/database.types";

export interface ITagService {
  createTagForPost(
    tagName: string,
    postId: number
  ): Promise<{ data: Tables<"posttags"> | null; error: Error | null }>;
}
