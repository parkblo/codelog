function parseSampleRate(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getSentryEnabled() {
  const fromEnv = parseBoolean(process.env.NEXT_PUBLIC_SENTRY_ENABLED);

  if (fromEnv !== undefined) {
    return fromEnv;
  }

  return process.env.NODE_ENV === "production";
}

export function getSentryTraceSampleRate() {
  return parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.2);
}

export function getSentryReplaySessionSampleRate() {
  return parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    0.05,
  );
}

export function getSentryReplayOnErrorSampleRate() {
  return parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    1,
  );
}
