import * as Sentry from "@sentry/nextjs";

import { getSentryEnabled, getSentryTraceSampleRate } from "./sentry.shared";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: getSentryEnabled(),
  tracesSampleRate: getSentryTraceSampleRate(),
});
