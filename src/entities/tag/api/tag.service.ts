import { createClient } from "@/shared/lib/utils/supabase/server";
import { Tables } from "@/shared/types/database.types";

import { ITagService } from "./tag.interface";

export class TagService implements ITagService {
  async createTagForPost(
    tagName: string,
    postId: number
  ): Promise<{ data: Tables<"posttags"> | null; error: Error | null }> {
    const supabase = await createClient();
    let tagId: number;

    const { data: existingTag } = await supabase
      .from("tags")
      .select()
      .eq("name", tagName)
      .maybeSingle();

    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: createdTag, error: createTagError } = await supabase
        .from("tags")
        .insert({ name: tagName })
        .select()
        .single();

      if (!createdTag || createTagError) {
        return { data: null, error: createTagError };
      }

      tagId = createdTag.id;
    }

    const { data: createdPostTag, error: createPostTagError } = await supabase
      .from("posttags")
      .insert({
        post_id: postId,
        tag_id: tagId,
      })
      .select()
      .single();

    if (createPostTagError) {
      return { data: null, error: createPostTagError };
    }

    return { data: createdPostTag, error: null };
  }

  async getTrendingTags(limit: number) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_trending_tags", {
      p_limit: limit,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }
}
