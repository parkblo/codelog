import type { Metadata } from "next";

import { PostDetailPage } from "@/pages/post-detail";
import { getPostByIdCached } from "@/entities/post/server";
import {
  getPostPath,
  getPostSeoDescription,
  getPostSeoTitle,
} from "@/shared/lib/seo";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const { data: post } = await getPostByIdCached(Number(postId));

  if (!post) {
    return {
      title: "CodeLog 오늘 기록",
    };
  }

  const authorName = post.author.nickname || post.author.username;
  const title = getPostSeoTitle(post);
  const description = getPostSeoDescription(post);
  const postPath = getPostPath(post.id);

  return {
    title,
    description,
    alternates: {
      canonical: postPath,
    },
    openGraph: {
      title: `${title} | CodeLog`,
      description,
      url: postPath,
      type: "article",
      authors: [authorName],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CodeLog`,
      description,
    },
  };
}

export default async function Page({ params }: PostPageProps) {
  const { postId } = await params;
  return <PostDetailPage postId={postId} />;
}
