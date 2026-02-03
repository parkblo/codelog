"use server";

import { TagService } from "@/entities/tag/api/tag.service";

export async function getTrendingTagsAction(limit: number) {
  const tagService = new TagService();
  const { data, error } = await tagService.getTrendingTags(limit);
  const randomSeed = Math.floor(Math.random() * 1000);

  if (error) {
    return { data: null, error: error.message, randomSeed };
  }

  return { data, error: null, randomSeed };
}
