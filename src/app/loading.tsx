import { PostSkeleton } from "@/components/post/PostSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="space-y-4">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
}
