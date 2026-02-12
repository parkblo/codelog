"use client";

import { useEffect } from "react";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
let isPostHogInitialized = false;

interface PostHogProviderProps {
  children: React.ReactNode;
}

function initializePostHog() {
  if (!POSTHOG_KEY || isPostHogInitialized || typeof window === "undefined") {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
      },
    },
  });
  isPostHogInitialized = true;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initializePostHog();
  }, []);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogReactProvider client={posthog}>{children}</PostHogReactProvider>;
}
