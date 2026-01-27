"use server";

import { ServerAuthService } from "@/entities/user/api/server-auth.service";
import { BookmarkService } from "@/entities/bookmark/api/bookmark.service";
import { LikeService } from "@/entities/like/api/like.service";
import { CreatePostDTO } from "@/entities/post/api/post.interface";
import { PostService } from "@/entities/post/api/post.service";
import { revalidatePath } from "next/cache";
import { CommentService } from "@/entities/comment/api/comment.service";

const postService = new PostService();

async function createPostAction(data: CreatePostDTO) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 데이터의 author는 클라이언트에서 오므로, 서버의 신뢰할 수 있는 user 정보로 덮어씌웁니다.
  const secureData = { ...data, author: user };

  const { data: newPost, error } = await postService.createPost(secureData);

  if (error || !newPost) {
    console.error(error);
    return { error: error?.message || "포스트 작성에 실패했습니다." };
  }

  revalidatePath("/home");

  return { data: newPost, error: null };
}

async function updatePostAction(id: number, data: Partial<CreatePostDTO>) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 소유권 확인
  const { data: originalPost, error: fetchError } =
    await postService.getPostById(id);

  if (fetchError || !originalPost) {
    return { error: "포스트를 찾을 수 없습니다." };
  }

  if (originalPost.author.id !== user.id) {
    return { error: "본인의 포스트만 수정할 수 있습니다." };
  }

  if (data.code !== undefined && data.code !== originalPost.code) {
    const commentService = new CommentService();
    const { count, error: countError } =
      await commentService.getReviewCommentsCount(id);

    if (countError) {
      return { error: "댓글 정보를 확인하는 중 오류가 발생했습니다." };
    }

    if (count && count > 0) {
      return {
        error: "코드 리뷰가 존재하는 포스트는 코드를 수정할 수 없습니다.",
      };
    }
  }

  const { data: updatedPost, error } = await postService.updatePost(id, data);

  if (error || !updatedPost) {
    console.error(error);
    return { error: error?.message || "포스트 수정에 실패했습니다." };
  }

  revalidatePath("/home");

  return { data: updatedPost, error: null };
}

async function getPostsAction(
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

async function getPostByIdAction(id: number) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  const { data: post, error: getPostError } = await postService.getPostById(id);

  if (getPostError || !post) {
    console.error(getPostError);
    return {
      error:
        getPostError?.message || `id:${id} 포스트 불러오기에 실패했습니다.`,
    };
  }

  if (!user) {
    return {
      data: { ...post, is_liked: false, is_bookmarked: false },
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
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 소유권 확인
  const { data: originalPost, error: fetchError } =
    await postService.getPostById(id);

  if (fetchError || !originalPost) {
    return { error: "포스트를 찾을 수 없습니다." };
  }

  if (originalPost.author.id !== user.id) {
    return { error: "본인의 포스트만 삭제할 수 있습니다." };
  }

  const { error } = await postService.deletePost(id);

  if (error) {
    console.error(error);
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
