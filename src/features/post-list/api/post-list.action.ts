"use server";

import { BookmarkService } from "@/entities/bookmark/api/bookmark.service";
import { LikeService } from "@/entities/like/api/like.service";
import { PostService } from "@/entities/post/api/post.service";
import { ServerAuthService } from "@/entities/user/server";

const postService = new PostService();

export async function getPostListAction(
  options: {
    isReviewEnabled?: boolean;
    authorId?: string;
    likedByUserId?: string;
    bookmarkedByUserId?: string;
    keyword?: string;
    tag?: string;
  } = {},
) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  const { data: posts, error: getPostsError } =
    await postService.getPosts(options);

  if (getPostsError) {
    console.error(getPostsError);
    return {
      data: null,
      error: getPostsError.message || "게시글 불러오기에 실패했습니다.",
    };
  }

  // 비로그인 시 좋아요 여부 false로 설정하고 반환
  if (!user) {
    return {
      data: posts?.map((post) => ({
        ...post,
        is_liked: false,
        is_bookmarked: false,
      })),
      error: null,
    };
  }

  const likeService = new LikeService();

  const { data: postLikes, error: postLikesError } =
    await likeService.getPostLikes(user.id);

  if (postLikesError) {
    return {
      data: null,
      error: postLikesError.message || "게시글 좋아요에 실패했습니다.",
    };
  }

  const bookmarkService = new BookmarkService();

  const { data: postBookmarks, error: postBookmarksError } =
    await bookmarkService.getBookmarks(user.id);

  if (postBookmarksError) {
    return {
      data: null,
      error: postBookmarksError.message || "게시글 북마크에 실패했습니다.",
    };
  }

  const data = posts?.map((post) => {
    return {
      ...post,
      is_liked: postLikes?.includes(post.id),
      is_bookmarked: postBookmarks?.includes(post.id),
    };
  });

  return { data, error: null };
}
