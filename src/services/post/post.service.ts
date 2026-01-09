import { createClient } from "@/utils/supabase/server";
import { CreatePostDTO, IPostService } from "./post.interface";
import { Post } from "@/types/types";
import { Database, Tables } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type RpcDatabase = Database & {
  public: {
    Functions: {
      create_post_with_tags: {
        Args: {
          post_data: {
            content: string;
            code: string | null;
            language: string | null;
            user_id: string;
            is_review_enabled: boolean;
          };
          tags: string[];
        };
        Returns: Tables<"posts">;
      };
      update_post_with_tags: {
        Args: {
          p_post_id: number;
          post_data: {
            content?: string;
            code?: string | null;
            language?: string | null;
            is_review_enabled?: boolean;
          };
          tags: string[] | null;
        };
        Returns: Tables<"posts">;
      };
    };
  };
};

export class PostService implements IPostService {
  async createPost(
    data: CreatePostDTO
  ): Promise<{ data: Post | null; error: Error | null }> {
    const supabase = await createClient();

    const { data: insertedPost, error } = await (
      supabase as SupabaseClient<RpcDatabase>
    ).rpc("create_post_with_tags", {
      post_data: {
        content: data.content,
        code: data.code,
        language: data.language,
        user_id: data.author.id,
        is_review_enabled: data.is_review_enabled,
      },
      tags: data.tags,
    });

    if (error || !insertedPost) {
      return { data: null, error };
    }

    const newPost: Post = {
      ...(insertedPost as Tables<"posts">),
      author: data.author,
      tags: data.tags,
    };

    return { data: newPost, error: null };
  }

  async getPosts({
    isReviewEnabled = false,
    authorId,
    likedByUserId,
    bookmarkedByUserId,
    keyword,
    tag,
  }: {
    isReviewEnabled?: boolean;
    authorId?: string;
    likedByUserId?: string;
    bookmarkedByUserId?: string;
    keyword?: string;
    tag?: string;
  } = {}): Promise<{ data: Post[] | null; error: Error | null }> {
    const supabase = await createClient();

    let selectString = `
      *,
      author:users!posts_user_id_fkey(*),
      tags:posttags(tags(*))`;

    if (likedByUserId) {
      selectString += `, post_likes!inner(user_id)`;
    }

    if (bookmarkedByUserId) {
      selectString += `, bookmarks!inner(user_id)`;
    }

    if (tag) {
      selectString += `, filter_tags:posttags!inner(tags!inner(name))`;
    }

    let query = supabase.from("posts").select(selectString);

    if (isReviewEnabled) {
      query = query.eq("is_review_enabled", true);
    }

    if (authorId) {
      query = query.eq("user_id", authorId);
    }

    if (likedByUserId) {
      query = query.eq("post_likes.user_id", likedByUserId);
    }

    if (bookmarkedByUserId) {
      query = query.eq("bookmarks.user_id", bookmarkedByUserId);
    }

    if (keyword) {
      const escapedKeyword = keyword.replace(/[%_]/g, "\\$&");
      query = query.or(
        `content.ilike.%${escapedKeyword}%,code.ilike.%${escapedKeyword}%`
      );
    }

    if (tag) {
      query = query.eq("filter_tags.tags.name", tag);
    }

    query = query.order("created_at", { ascending: false });

    interface PostQueryResult extends Tables<"posts"> {
      author: Tables<"users">;
      tags: { tags: { name: string } | null }[] | null;
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    const posts = (data as unknown as PostQueryResult[]).map((post) => ({
      ...post,
      tags:
        post.tags
          ?.map((t) => t.tags?.name)
          .filter((name): name is string => !!name) ?? [],
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

    if (error || !data) {
      return { data: null, error };
    }

    const post = {
      ...data,
      author: data.author as Tables<"users">,
      tags:
        (data.tags as { tags: { name: string } | null }[])
          ?.map((t) => t.tags?.name)
          .filter((name): name is string => !!name) ?? [],
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

    const { tags, ...postFields } = data;

    // 글 내용 업데이트
    const { error } = await (supabase as SupabaseClient<RpcDatabase>).rpc(
      "update_post_with_tags",
      {
        p_post_id: id,
        post_data: {
          content: postFields.content,
          code: postFields.code,
          language: postFields.language,
          is_review_enabled: postFields.is_review_enabled,
        },
        tags: tags ?? [],
      }
    );

    if (error) {
      return { data: null, error };
    }

    // RPC는 업데이트된 post row를 반환하지만, author와 tags가 포함된 전체 Post 객체를 반환해야하기 때문에, 재조회합니다.

    return this.getPostById(id);
  }
}
