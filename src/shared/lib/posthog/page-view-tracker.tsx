"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { captureEvent } from "./client";

export function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  useEffect(() => {
    const url = search ? `${pathname}?${search}` : pathname;

    captureEvent("page_viewed", {
      path: pathname,
      query: search || undefined,
      url,
    });
  }, [pathname, search]);

  return null;
}
