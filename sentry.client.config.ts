import * as Sentry from "@sentry/nextjs";

import {
  getSentryEnabled,
  getSentryReplayOnErrorSampleRate,
  getSentryReplaySessionSampleRate,
  getSentryTraceSampleRate,
} from "./sentry.shared";

export function initSentryClient() {
  const replaysSessionSampleRate = getSentryReplaySessionSampleRate();
  const replaysOnErrorSampleRate = getSentryReplayOnErrorSampleRate();
  const shouldEnableReplay =
    replaysSessionSampleRate > 0 || replaysOnErrorSampleRate > 0;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: getSentryEnabled(),
    tracesSampleRate: getSentryTraceSampleRate(),
    replaysSessionSampleRate,
    replaysOnErrorSampleRate,
    integrations: shouldEnableReplay ? [Sentry.replayIntegration()] : [],
  });
}
