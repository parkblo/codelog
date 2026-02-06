import type { Metadata } from "next";

import { PostDetailPage } from "@/pages/post-detail";
import { getPostByIdAction } from "@/entities/post";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const { data: post } = await getPostByIdAction(Number(postId));

  if (!post) {
    return {
      title: "CodeLog 게시글",
    };
  }

  // content에서 앞 150자를 description으로 사용
  const description =
    post.content.slice(0, 150).replace(/\n/g, " ") +
    (post.content.length > 150 ? "..." : "");

  return {
    title: `${post.author.username}의 게시글`,
    description,
    openGraph: {
      title: `${post.author.username}의 게시글 | CodeLog`,
      description,
      type: "article",
      authors: [post.author.username],
    },
  };
}

export default async function Page({ params }: PostPageProps) {
  const { postId } = await params;
  return <PostDetailPage postId={postId} />;
}
