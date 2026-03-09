import { CreatePostForm } from "@/widgets/create-post";
import { WelcomeCard } from "@/widgets/sidebar";
import { getPostListPageAction } from "@/features/post-list";

import { HomeFeedInfiniteList } from "./home-feed-infinite-list";

const HOME_INITIAL_POST_LIMIT = 6;

export async function HomePage() {
  const { data, error, hasMore } = await getPostListPageAction({
    offset: 0,
    limit: HOME_INITIAL_POST_LIMIT,
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
