"use server";

import { getBookmarks } from "@/entities/bookmark/api/bookmark.service";
import { getPostLikes } from "@/entities/like/api/like.service";
import { getPosts } from "@/entities/post/api/post.service";
import { getCurrentUser } from "@/entities/user/server";
import { Post } from "@/shared/types";

const DEFAULT_POST_LIST_PAGE_SIZE = 10;
const MAX_POST_LIST_PAGE_SIZE = 50;

type PostListFilterOptions = {
  isReviewEnabled?: boolean;
  authorId?: string;
  likedByUserId?: string;
  bookmarkedByUserId?: string;
  keyword?: string;
  tag?: string;
};

type PaginatedPostListOptions = PostListFilterOptions & {
  offset?: number;
  limit?: number;
};

function getSafePageSize(limit?: number) {
  if (!limit || limit <= 0) {
    return DEFAULT_POST_LIST_PAGE_SIZE;
  }

  return Math.min(limit, MAX_POST_LIST_PAGE_SIZE);
}

function getSafeOffset(offset?: number) {
  if (!offset || offset < 0) {
    return 0;
  }

  return offset;
}

async function resolvePostInteraction(posts: Post[] | null) {
  const user = await getCurrentUser();

  if (!posts) {
    return { data: [], error: null };
  }

  if (!user) {
    return {
      data: posts.map((post) => ({
        ...post,
        is_liked: false,
        is_bookmarked: false,
      })),
      error: null,
    };
  }

  const [
    { data: postLikes, error: postLikesError },
    { data: postBookmarks, error: postBookmarksError },
  ] =
    await Promise.all([
      getPostLikes(user.id),
      getBookmarks(user.id),
    ]);

  if (postLikesError) {
    return {
      data: null,
      error: postLikesError.message || "게시글 좋아요에 실패했습니다.",
    };
  }

  if (postBookmarksError) {
    return {
      data: null,
      error: postBookmarksError.message || "게시글 북마크에 실패했습니다.",
    };
  }

  return {
    data: posts.map((post) => ({
      ...post,
      is_liked: postLikes?.includes(post.id),
      is_bookmarked: postBookmarks?.includes(post.id),
    })),
    error: null,
  };
}

export async function getPostListAction(
  options: PostListFilterOptions = {},
) {
  const { data: posts, error: getPostsError } = await getPosts(options);

  if (getPostsError) {
    console.error(getPostsError);
    return {
      data: null,
      error: getPostsError.message || "게시글 불러오기에 실패했습니다.",
    };
  }

  return resolvePostInteraction(posts);
}

export async function getPostListPageAction(
  options: PaginatedPostListOptions = {},
) {
  const safeLimit = getSafePageSize(options.limit);
  const safeOffset = getSafeOffset(options.offset);

  const { data: posts, error: getPostsError } = await getPosts({
    ...options,
    offset: safeOffset,
    limit: safeLimit + 1,
  });

  if (getPostsError) {
    console.error(getPostsError);
    return {
      data: null,
      error: getPostsError.message || "게시글 불러오기에 실패했습니다.",
      hasMore: false,
    };
  }

  const { data: postsWithInteraction, error: interactionError } =
    await resolvePostInteraction(posts);

  if (interactionError) {
    return {
      data: null,
      error: interactionError,
      hasMore: false,
    };
  }

  const safePosts = postsWithInteraction ?? [];
  const hasMore = safePosts.length > safeLimit;

  return {
    data: hasMore
      ? safePosts.slice(0, safeLimit)
      : safePosts,
    error: null,
    hasMore,
  };
}
