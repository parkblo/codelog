import { PostDetailPage } from "@/widgets/post-detail-page";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function Page({ params }: PostPageProps) {
  const { postId } = await params;
  return <PostDetailPage postId={postId} />;
}
