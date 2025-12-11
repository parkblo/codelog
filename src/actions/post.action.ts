"use server";

import { ServerAuthService } from "@/services/auth/server-auth.service";
import { BookmarkService } from "@/services/bookmark/bookmark.service";
import { LikeService } from "@/services/like/like.service";
import { CreatePostDTO } from "@/services/post/post.interface";
import { PostService } from "@/services/post/post.service";
import { revalidatePath } from "next/cache";

const postService = new PostService();

async function createPostAction(data: CreatePostDTO) {
  const { data: newPost, error } = await postService.createPost(data);

  if (error || !newPost) {
    // TODO- 추가적인 에러 핸들링 필요
    return { error: error?.message || "포스트 작성에 실패했습니다." };
  }

  revalidatePath("/home");

  return { data: newPost, error: null };
}

async function updatePostAction(id: number, data: Partial<CreatePostDTO>) {
  const { data: updatedPost, error } = await postService.updatePost(id, data);

  if (error || !updatedPost) {
    // TODO- 추가적인 에러 핸들링 필요
    return { error: error?.message || "포스트 수정에 실패했습니다." };
  }

  revalidatePath("/home");

  return { data: updatedPost, error: null };
}

async function getPostsAction() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  const { data: posts, error: getPostsError } = await postService.getPosts();

  if (getPostsError) {
    return { data: null, error: getPostsError };
  }

  // 비로그인 시 좋아요 여부 false로 설정하고 반환
  if (!user) {
    return {
      data: posts?.map((post) => ({ ...post, is_liked: false })),
      error: null,
    };
  }

  const likeService = new LikeService();

  const { data: postLikes, error: postLikesError } =
    await likeService.getPostLikes(user.id);

  if (postLikesError) {
    return { data: null, error: postLikesError };
  }

  const bookmarkService = new BookmarkService();

  const { data: postBookmarks, error: postBookmarksError } =
    await bookmarkService.getBookmarks(user.id);

  if (postBookmarksError) {
    return { data: null, error: postBookmarksError };
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

async function getPostByIdAction(id: number) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  const { data: post, error: getPostError } = await postService.getPostById(id);

  if (getPostError || !post) {
    return {
      error:
        getPostError?.message || `id:${id} 포스트 불러오기에 실패했습니다.`,
    };
  }

  if (!user) {
    return {
      data: { ...post, is_liked: false },
      error: null,
    };
  }

  const likeService = new LikeService();

  const { data: postLikes, error: postLikesError } =
    await likeService.getPostLikes(user?.id);

  if (postLikesError) {
    return { data: null, error: postLikesError };
  }

  const bookmarkService = new BookmarkService();

  const { data: postBookmarks, error: postBookmarksError } =
    await bookmarkService.getBookmarks(user?.id);

  if (postBookmarksError) {
    return { data: null, error: postBookmarksError };
  }

  const data = {
    ...post,
    is_liked: postLikes?.includes(post.id),
    is_bookmarked: postBookmarks?.includes(post.id),
  };

  return { data, error: null };
}

async function deletePostAction(id: number) {
  const { error } = await postService.deletePost(id);

  if (error) {
    // TODO- 추가적인 에러 핸들링 필요
    console.error(error?.message || "포스트 삭제에 실패했습니다.");
    return { error: error?.message || "포스트 삭제에 실패했습니다." };
  }

  revalidatePath("/home");
  return { error: null };
}

export {
  createPostAction,
  updatePostAction,
  getPostsAction,
  getPostByIdAction,
  deletePostAction,
};
