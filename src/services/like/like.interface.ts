export interface ILikeService {
  createPostLike(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;
  deletePostLike(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;
  createCommentLike(
    commentId: number,
    userId: string
  ): Promise<{ error: Error | null }>;
  deleteCommentLike(
    commentId: number,
    userId: string
  ): Promise<{ error: Error | null }>;
  getPostLikes(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }>;
  getCommentLikes(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }>;
}
