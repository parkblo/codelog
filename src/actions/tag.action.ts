"use server";

import { TagService } from "@/services/tag/tag.service";

export async function getTrendingTagsAction(limit: number) {
  const tagService = new TagService();
  const { data, error } = await tagService.getTrendingTags(limit);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
