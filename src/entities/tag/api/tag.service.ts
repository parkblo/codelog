import { getDatabaseAdapter } from "@/shared/lib/database";
import { Tables } from "@/shared/types/database.types";

export async function createTagForPost(
  tagName: string,
  postId: number,
): Promise<{ data: Tables<"posttags"> | null; error: Error | null }> {
  const db = getDatabaseAdapter();
  let tagId: number;

  const { data: existingTag } = await db.query<Tables<"tags">>(
    {
      table: "tags",
      select: "*",
      filters: [{ column: "name", value: tagName }],
    },
    "maybeSingle",
  );

  if (existingTag) {
    tagId = existingTag.id;
  } else {
    const { data: createdTag, error: createTagError } = await db.insert<Tables<"tags">>(
      "tags",
      { name: tagName },
      { select: "*", mode: "single" },
    );

    if (!createdTag || createTagError) {
      return { data: null, error: createTagError };
    }

    tagId = createdTag.id;
  }

  const { data: createdPostTag, error: createPostTagError } =
    await db.insert<Tables<"posttags">>(
      "posttags",
      {
        post_id: postId,
        tag_id: tagId,
      },
      { select: "*", mode: "single" },
    );

  if (createPostTagError) {
    return { data: null, error: createPostTagError };
  }

  return { data: createdPostTag, error: null };
}

export async function getTrendingTags(limit: number) {
  const db = getDatabaseAdapter();
  const { data, error } = await db.rpc<{ name: string; post_count: number }[]>(
    "get_trending_tags",
    { p_limit: limit },
  );

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? [], error: null };
}
