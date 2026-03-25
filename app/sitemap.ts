import type { MetadataRoute } from "next";

import { getDatabaseAdapter } from "@/shared/lib/database";
import { CODELOG_BASE_URL, getPostPath } from "@/shared/lib/seo";

export const dynamic = "force-dynamic";

type SitemapPostRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
};

async function getPostPages(): Promise<MetadataRoute.Sitemap> {
  const db = getDatabaseAdapter();
  const pageSize = 500;
  const postPages: MetadataRoute.Sitemap = [];
  let from = 0;

  while (true) {
    const { data, error } = await db.query<SitemapPostRow[]>({
      table: "posts",
      select: "id, created_at, updated_at, author:users!posts_user_id_fkey!inner(id)",
      filters: [
        { column: "deleted_at", operator: "is", value: null },
        { column: "author.deleted_at", operator: "is", value: null },
      ],
      orderBy: { column: "created_at", ascending: false },
      range: { from, to: from + pageSize - 1 },
    });

    if (error) {
      throw error;
    }

    const posts = data ?? [];

    postPages.push(
      ...posts.map((post) => ({
        url: `${CODELOG_BASE_URL}${getPostPath(post.id)}`,
        lastModified: post.updated_at || post.created_at,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );

    if (posts.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return postPages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: CODELOG_BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const postPages = await getPostPages();

    return [...staticPages, ...postPages];
  } catch (error) {
    console.error("Failed to generate sitemap posts", error);

    return staticPages;
  }
}
