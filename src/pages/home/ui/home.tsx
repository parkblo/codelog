import { CreatePostForm } from "@/widgets/create-post";
import { WelcomeCard } from "@/widgets/sidebar";
import { getPostListPageAction } from "@/features/post-list";

import { HomeFeedInfiniteList } from "./home-feed-infinite-list";

export async function HomePage() {
  const { data, error, hasMore } = await getPostListPageAction({
    offset: 0,
    limit: 10,
  });

  if (!data || error) {
    return (
      <div className="p-4 space-y-4">
        <WelcomeCard />
        <CreatePostForm />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <WelcomeCard />
      <CreatePostForm />
      <HomeFeedInfiniteList initialPosts={data} initialHasMore={hasMore} />
    </div>
  );
}
