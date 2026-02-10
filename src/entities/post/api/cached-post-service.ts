import { cache } from "react";

import { PostService } from "./post.service";

const postService = new PostService();

export const getPostByIdCached = cache(async (id: number) => {
  return postService.getPostById(id);
});
