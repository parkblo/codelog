import { PostSkeleton } from "@/components/post/PostSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-62 w-full" />
      <div className="space-y-4">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
}
