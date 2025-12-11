export interface IBookmarkService {
  createBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: string | null }>;
  deleteBookmark(
    postId: number,
    userId: string
  ): Promise<{ error: string | null }>;
  getBookmarks(
    userId: string
  ): Promise<{ data: number[] | null; error: string | null }>;
}
