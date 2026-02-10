import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://codelog.vercel.app";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/code-review`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // TODO: 동적 페이지 (게시글, 프로필) 추가
  // const posts = await getPublicPosts();
  // const postPages = posts.map((post) => ({
  //   url: `${baseUrl}/post/${post.id}`,
  //   lastModified: post.updatedAt,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.6,
  // }));

  return [...staticPages];
}
