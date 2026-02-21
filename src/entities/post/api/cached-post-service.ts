import { cache } from "react";

import { getPostById } from "./post.service";

export const getPostByIdCached = cache(async (id: number) => {
  return getPostById(id);
});
