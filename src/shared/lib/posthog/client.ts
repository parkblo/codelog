import posthog from "posthog-js";

type EventProperties = Record<string, string | number | boolean | null | undefined>;

function isPostHogEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

function canUsePostHog() {
  return typeof window !== "undefined" && isPostHogEnabled();
}

export function captureEvent(eventName: string, properties?: EventProperties) {
  if (!canUsePostHog()) {
    return;
  }

  posthog.capture(eventName, properties);
}

export function identifyPostHogUser(userId: string, properties?: EventProperties) {
  if (!canUsePostHog()) {
    return;
  }

  posthog.identify(userId, properties);
}

export function resetPostHogUser() {
  if (!canUsePostHog()) {
    return;
  }

  posthog.reset();
}
