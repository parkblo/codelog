import * as Sentry from "@sentry/nextjs";

import {
  getSentryEnabled,
  getSentryReplayOnErrorSampleRate,
  getSentryReplaySessionSampleRate,
  getSentryTraceSampleRate,
} from "./sentry.shared";

export function initSentryClient() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: getSentryEnabled(),
    tracesSampleRate: getSentryTraceSampleRate(),
    replaysSessionSampleRate: getSentryReplaySessionSampleRate(),
    replaysOnErrorSampleRate: getSentryReplayOnErrorSampleRate(),
    integrations: [Sentry.replayIntegration()],
  });
}
