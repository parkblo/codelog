import { CreatePostForm } from "@/widgets/create-post";
import { requireAuth } from "@/features/auth/server";
import { getPostListPageAction } from "@/features/post-list";

import { HomeFeedInfiniteList } from "./home-feed-infinite-list";

const HOME_INITIAL_POST_LIMIT = 6;

export async function HomePage() {
  await requireAuth("/home");

  const { data, error, hasMore } = await getPostListPageAction({
    offset: 0,
    limit: HOME_INITIAL_POST_LIMIT,
  });

  if (!data || error) {
    return (
      <div className="p-4 space-y-4">
        <CreatePostForm />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <CreatePostForm />
      <HomeFeedInfiniteList initialPosts={data} initialHasMore={hasMore} />
    </div>
  );
}
