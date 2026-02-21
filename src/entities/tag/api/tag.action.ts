"use server";

import { getTrendingTags } from "@/entities/tag/api/tag.service";

export async function getTrendingTagsAction(limit: number) {
  const { data, error } = await getTrendingTags(limit);
  const randomSeed = Math.floor(Math.random() * 1000);

  if (error) {
    return { data: null, error: error.message, randomSeed };
  }

  return { data, error: null, randomSeed };
}
