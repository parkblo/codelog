import { PostDetailPage } from "@/pages/post-detail";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function Page({ params }: PostPageProps) {
  const { postId } = await params;
  return <PostDetailPage postId={postId} />;
}
