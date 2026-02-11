import * as Sentry from "@sentry/nextjs";

import { initSentryClient } from "./sentry.client.config";

initSentryClient();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
