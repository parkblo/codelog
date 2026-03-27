"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

export function HomeStatusFeedback() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const safePathname = pathname ?? "/home";
  const hasHandledLockedToastRef = useRef(false);

  useEffect(() => {
    const todayState = searchParams?.get("today");

    if (todayState !== "locked") {
      hasHandledLockedToastRef.current = false;
      return;
    }

    if (hasHandledLockedToastRef.current) {
      return;
    }

    hasHandledLockedToastRef.current = true;

    toast.info("오늘 글을 작성한 뒤 TODAY를 볼 수 있어요.", {
      id: "today-locked-feedback",
    });

    const nextSearchParams = new URLSearchParams(searchParams?.toString());
    nextSearchParams.delete("today");
    const nextQuery = nextSearchParams.toString();

    router.replace(nextQuery ? `${safePathname}?${nextQuery}` : safePathname, {
      scroll: false,
    });
  }, [router, safePathname, searchParams]);

  return null;
}
