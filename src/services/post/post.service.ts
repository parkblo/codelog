import { createClient } from "@/utils/supabase/server";
import { CreatePostDTO, IPostService } from "./post.interface";
import { Post } from "@/types/types";

export class PostService implements IPostService {
  async createPost(
    data: CreatePostDTO
  ): Promise<{ data: Post | null; error: Error | null }> {
    const supabase = await createClient();

    const { data: insertedPost, error } = await supabase
      .from("posts")
      .insert({
        content: data.content,
        code: data.code,
        language: data.language,
        user_id: data.author.id,
      })
      .select()
      .single();

    if (error || !insertedPost) {
      return { data: null, error };
    }

    for (const tagName of data.tags) {
      let tagId: number;

      const { data: existingTag } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .maybeSingle();

      if (existingTag) {
        tagId = existingTag.id;
      } else {
        const { data: newTag, error: createTagError } = await supabase
          .from("tags")
          .insert({ name: tagName })
          .select("id")
          .single();
        if (createTagError || !newTag) {
          console.error("Failed to create tag: ", tagName);
          continue;
        }
        tagId = newTag.id;
      }

      const { error: createPostTagError } = await supabase
        .from("posttags")
        .insert({ post_id: insertedPost.id, tag_id: tagId });

      if (createPostTagError) {
        console.error("Failed to create tag: ", tagName);
        continue;
      }
    }

    const newPost: Post = {
      ...insertedPost,
      author: data.author,
      tags: data.tags,
    };

    return { data: newPost, error: null };
  }

  async getPosts(): Promise<{ data: Post[] | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("posts").select(`
        *,
        author:users(*),
        tags:posttags(tags(*))`);

    if (error) {
      return { data: null, error };
    }

    const posts = data.map((post) => ({
      ...post,
      tags: post.tags.map((t) => t.tags.name),
    }));

    return { data: posts, error: null };
  }

  async getPostById(
    id: number
  ): Promise<{ data: Post | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select(`*, author:users(*), tags:posttags(tags(*))`)
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error };
    }

    const post = {
      ...data,
      author: data.author,
      tags: data.tags.map((t) => t.tags.name),
    };

    return { data: post, error: null };
  }

  async deletePost(id: number): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase.from("posts").delete().eq("id", id);

    return { error };
  }

  async updatePost(
    id: number,
    data: Partial<CreatePostDTO>
  ): Promise<{ data: Post | null; error: Error | null }> {
    const supabase = await createClient();

    const { tags, author, ...postFields } = data;

    // 글 내용 업데이트
    const { data: updatedPost, error } = await supabase
      .from("posts")
      .update(postFields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // 태그 업데이트
    if (tags) {
      await supabase.from("posttags").delete().eq("post_id", id);

      for (const tagName of tags) {
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

        const { data: createdPostTag, error: createPostTagError } =
          await supabase.from("posttags").insert({
            post_id: updatedPost.id,
            tag_id: tagId,
          });

        if (createPostTagError) {
          return { data: null, error: createPostTagError };
        }
      }
    }

    return this.getPostById(id);
  }
}
