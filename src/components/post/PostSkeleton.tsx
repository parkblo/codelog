import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2">
          {/* Author Info Area */}
          <div className="flex flex-1 min-w-0 gap-2 justify-between">
            <div className="flex gap-2 items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {/* Content Area */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
            </div>

            {/* Code Snippet Area */}
            <div className="rounded-md border p-4 space-y-2 bg-muted/20">
              <Skeleton className="h-4 w-32 mb-4" />{" "}
              {/* Language badge or filename */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
            </div>
          </div>

          {/* Tags Area */}
          <div className="flex gap-2 pb-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>

          {/* Interaction Area */}
          <div className="flex gap-4 border-t pt-2 justify-between mt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
