import { BackButton } from "@/components/ui/back-button";
import { PostSkeleton } from "@/components/post/PostSkeleton";

export default function Loading() {
  return (
    <div className="p-4 space-y-4">
      <div className="sticky flex gap-2 items-center w-full bg-background z-10">
        <BackButton />
      </div>
      <PostSkeleton />
    </div>
  );
}
