import { Comment } from "@/types/types";

export interface CreateCommentDTO {
  content: string;
  postId: number;
  userId: string;
  startLine?: number | null;
  endLine?: number | null;
}

export interface UpdateCommentDTO {
  content: string;
}

export interface ICommentService {
  createComment(
    data: CreateCommentDTO
  ): Promise<{ data: Comment | null; error: Error | null }>;
  updateComment(
    id: number,
    data: UpdateCommentDTO
  ): Promise<{ data: Comment | null; error: Error | null }>;
  deleteComment(id: number): Promise<{ error: Error | null }>;
  getCommentsByPostId(
    postId: number
  ): Promise<{ data: Comment[] | null; error: Error | null }>;
}
