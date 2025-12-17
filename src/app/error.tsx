"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center space-y-4 p-4 text-center">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">
          문제가 발생했습니다
        </h2>
        <p className="text-muted-foreground">
          죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다.
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
