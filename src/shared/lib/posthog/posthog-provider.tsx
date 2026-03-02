"use client";

import { useEffect } from "react";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
let isPostHogInitialized = false;
let isSessionRecordingScheduled = false;
const SESSION_RECORDING_DEFER_MS = 3000;

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
    disable_session_recording: true,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
      },
    },
  });
  isPostHogInitialized = true;
}

function scheduleSessionRecordingStart() {
  if (
    !POSTHOG_KEY ||
    typeof window === "undefined" ||
    isSessionRecordingScheduled
  ) {
    return;
  }

  isSessionRecordingScheduled = true;

  const startRecording = () => {
    posthog.startSessionRecording();
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(startRecording, {
      timeout: SESSION_RECORDING_DEFER_MS,
    });
    return;
  }

  window.setTimeout(startRecording, SESSION_RECORDING_DEFER_MS);
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initializePostHog();
    scheduleSessionRecordingStart();
  }, []);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogReactProvider client={posthog}>{children}</PostHogReactProvider>;
}
