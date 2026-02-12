import posthog from "posthog-js";

type EventProperties = Record<string, string | number | boolean | null | undefined>;
type SanitizedEventProperties = Record<string, string | number | boolean | null>;

function isPostHogEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

function canUsePostHog() {
  return typeof window !== "undefined" && isPostHogEnabled();
}

function sanitizeProperties(
  properties?: EventProperties,
): SanitizedEventProperties | undefined {
  if (!properties) {
    return undefined;
  }

  const sanitizedEntries = Object.entries(properties).filter(([, value]) => {
    if (value === undefined) {
      return false;
    }

    if (typeof value === "number" && Number.isNaN(value)) {
      return false;
    }

    return true;
  });

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries) as SanitizedEventProperties;
}

export function captureEvent(eventName: string, properties?: EventProperties) {
  if (!canUsePostHog()) {
    return;
  }

  posthog.capture(eventName, sanitizeProperties(properties));
}

export function identifyPostHogUser(userId: string, properties?: EventProperties) {
  if (!canUsePostHog()) {
    return;
  }

  posthog.identify(userId, sanitizeProperties(properties));
}

export function resetPostHogUser() {
  if (!canUsePostHog()) {
    return;
  }

  posthog.reset();
}
