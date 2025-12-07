"use server";

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
  const { data, error } = await postService.getPosts();

  if (error) {
    // TODO- 추가적인 에러 핸들링 필요
    return { error: error?.message || "포스트 불러오기에 실패했습니다." };
  }

  return { data, error: null };
}

async function getPostByIdAction(id: number) {
  const { data, error } = await postService.getPostById(id);

  if (error || !data) {
    // TODO- 추가적인 에러 핸들링 필요
    return {
      error: error?.message || `id:${id} 포스트 불러오기에 실패했습니다.`,
    };
  }

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
