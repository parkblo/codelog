import { Tables } from "@/types/database.types";
import { ITagService } from "./tag.interface";
import { createClient } from "@/utils/supabase/server";

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
}
