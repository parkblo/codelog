"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

export function HomeStatusFeedback() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const safePathname = pathname ?? "/home";

  useEffect(() => {
    const todayState = searchParams?.get("today");

    if (todayState !== "locked") {
      return;
    }

    toast.info("오늘 글을 작성한 뒤 TODAY를 볼 수 있어요.");

    const nextSearchParams = new URLSearchParams(searchParams?.toString());
    nextSearchParams.delete("today");
    const nextQuery = nextSearchParams.toString();

    router.replace(nextQuery ? `${safePathname}?${nextQuery}` : safePathname, {
      scroll: false,
    });
  }, [router, safePathname, searchParams]);

  return null;
}
