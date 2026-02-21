"use server";

import { getBookmarks } from "@/entities/bookmark/api/bookmark.service";
import { getPostLikes } from "@/entities/like/api/like.service";
import { getPostById } from "@/entities/post/api/post.service";
import { getCurrentUser } from "@/entities/user/server";

export async function getPostDetailAction(postId: number) {
  const user = await getCurrentUser();

  const { data: post, error } = await getPostById(postId);

  if (error || !post) {
    return {
      data: null,
      error: error?.message || "포스트를 찾을 수 없습니다.",
    };
  }

  // 비로그인 시 interaction 정보 false로 설정
  if (!user) {
    return {
      data: {
        ...post,
        is_liked: false,
        is_bookmarked: false,
      },
      error: null,
    };
  }

  // 로그인 시 interaction 정보 조회 (좋아요, 북마크)
  const [{ data: postLikes }, { data: postBookmarks }] = await Promise.all([
    getPostLikes(user.id),
    getBookmarks(user.id),
  ]);

  return {
    data: {
      ...post,
      is_liked: postLikes?.includes(postId) ?? false,
      is_bookmarked: postBookmarks?.includes(postId) ?? false,
    },
    error: null,
  };
}
