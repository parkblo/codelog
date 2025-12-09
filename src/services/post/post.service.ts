import { createClient } from "@/utils/supabase/server";
import { CreatePostDTO, IPostService } from "./post.interface";
import { Post } from "@/types/types";
import { TagService } from "../tag/tag.service";

export class PostService implements IPostService {
  async createPost(
    data: CreatePostDTO
  ): Promise<{ data: Post | null; error: Error | null }> {
    const supabase = await createClient();
    const tagService = new TagService();

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
      const { data: createdPostTag, error: createPostTagError } =
        await tagService.createTagForPost(tagName, insertedPost.id);

      if (createPostTagError || !createdPostTag) {
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

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:users!posts_user_id_fkey(*),
        tags:posttags(tags(*))`
      )
      .order("created_at", { ascending: false });

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
      .select(`*, author:users!posts_user_id_fkey(*), tags:posttags(tags(*))`)
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
    const tagService = new TagService();

    const { tags, author, ...postFields } = data;

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    // 작성자 확인
    const { data: originalPost, error: fetchError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !originalPost) {
      return { data: null, error: new Error("Post not found") };
    }

    if (originalPost.user_id !== userData.user.id) {
      return {
        data: null,
        error: new Error("Unauthorized: You do not own this post"),
      };
    }

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

    if (tags) {
      await supabase.from("posttags").delete().eq("post_id", id);

      for (const tagName of tags) {
        const { data: createdPostTag, error: createPostTagError } =
          await tagService.createTagForPost(tagName, id);

        if (createPostTagError || !createdPostTag) {
          return { data: null, error: createPostTagError };
        }
      }
    }

    return this.getPostById(id);
  }
}
