"use server";

import { revalidatePath } from "next/cache";

// eslint-disable-next-line boundaries/element-types
import { CommentService } from "@/entities/comment/api/comment.service";
import { CreatePostDTO } from "@/entities/post/api/post.interface";
import { PostService } from "@/entities/post/api/post.service";
// eslint-disable-next-line boundaries/element-types
import { ServerAuthService } from "@/entities/user/api/server-auth.service";

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

// getPostsAction removed. Use getPostListAction from @/features/post-list instead.

async function getPostByIdAction(id: number) {
  const { data: post, error: getPostError } = await postService.getPostById(id);

  if (getPostError || !post) {
    console.error(getPostError);
    return {
      error:
        getPostError?.message || `id:${id} 포스트 불러오기에 실패했습니다.`,
    };
  }

  // Pure Entity Action: Return post data only.
  // Interaction state (liked/bookmarked) must be composed in a Feature/Widget.
  return { data: post, error: null };
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
  deletePostAction,
  getPostByIdAction,
  updatePostAction,
};
