export interface IBookmarkService {
  createBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;
  deleteBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: Error | null }>;
  getBookmarks(
    userId: string
  ): Promise<{ data: number[] | null; error: Error | null }>;
}
