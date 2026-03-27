import { CreatePostForm } from "@/widgets/create-post";
import { requireAuth } from "@/features/auth/server";
import { Separator } from "@/shared/ui/separator";

import { HomeFeedInfiniteList } from "./home-feed-infinite-list";
import { HomeStatusFeedback } from "./home-status-feedback";
import { TodaySection } from "./today-section";

export async function HomePage() {
  await requireAuth("/home");

  return (
    <div className="p-4 space-y-4">
      <HomeStatusFeedback />
      <CreatePostForm />
      <TodaySection />
      <div className="px-1">
        <Separator className="bg-white/8" />
      </div>
      <HomeFeedInfiniteList />
    </div>
  );
}
