import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatRelativeTime,
  generateContributionData,
  getCurrentLocalDayContext,
  getLocalDateKey,
  isValidLocalDayContext,
} from "./date";

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function withTimezone<T>(timezone: string, run: () => T): T {
  const previousTimezone = process.env.TZ;

  process.env.TZ = timezone;

  try {
    return run();
  } finally {
    if (previousTimezone === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = previousTimezone;
    }
  }
}

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-04T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("시간 차이에 따라 상대 시간을 반환한다", () => {
    expect(formatRelativeTime("2026-03-03T23:59:30.000Z")).toBe("방금 전");
    expect(formatRelativeTime("2026-03-03T23:58:00.000Z")).toBe("2분 전");
    expect(formatRelativeTime("2026-03-03T22:00:00.000Z")).toBe("2시간 전");
    expect(formatRelativeTime("2026-03-01T00:00:00.000Z")).toBe("3일 전");
  });
});

describe("generateContributionData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-04T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("최근 365일 데이터를 생성하고 입력 데이터를 반영한다", () => {
    const today = new Date("2026-03-04T00:00:00.000Z");
    const todayKey = formatDate(today);
    const input = [
      { contribution_date: todayKey, post_count: 7 },
      { contribution_date: "2026-01-01", post_count: 3 },
    ];

    const result = generateContributionData(input);

    expect(result).toHaveLength(365);
    expect(result[result.length - 1]?.contribution_date).toBe(todayKey);
    expect(result.find((item) => item.contribution_date === todayKey)?.post_count).toBe(7);
    expect(result.find((item) => item.contribution_date === "2026-01-01")?.post_count).toBe(3);
  });
});

describe("local day helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-04T15:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("getLocalDateKey는 timezone offset 기준 날짜 키를 계산한다", () => {
    expect(getLocalDateKey("2026-03-04T15:30:00.000Z", -540)).toBe("2026-03-05");
    expect(getLocalDateKey("2026-03-04T15:30:00.000Z", 480)).toBe("2026-03-04");
  });

  it("getCurrentLocalDayContext는 현재 로컬 날짜 범위를 반환한다", () => {
    const context = getCurrentLocalDayContext(new Date("2026-03-04T15:30:00.000Z"));

    expect(context).toEqual({
      dateKey: "2026-03-05",
      dayStartAt: "2026-03-04T15:00:00.000Z",
      dayEndAt: "2026-03-05T14:59:59.999Z",
      timezoneOffsetMinutes: -540,
    });
  });

  it("getCurrentLocalDayContext는 타임존마다 같은 UTC 시각을 다른 로컬 날짜 범위로 계산한다", () => {
    const seoulContext = withTimezone("Asia/Seoul", () =>
      getCurrentLocalDayContext(new Date("2026-03-04T15:30:00.000Z")),
    );
    const losAngelesContext = withTimezone("America/Los_Angeles", () =>
      getCurrentLocalDayContext(new Date("2026-03-04T15:30:00.000Z")),
    );

    expect(seoulContext).toEqual({
      dateKey: "2026-03-05",
      dayStartAt: "2026-03-04T15:00:00.000Z",
      dayEndAt: "2026-03-05T14:59:59.999Z",
      timezoneOffsetMinutes: -540,
    });
    expect(losAngelesContext).toEqual({
      dateKey: "2026-03-04",
      dayStartAt: "2026-03-04T08:00:00.000Z",
      dayEndAt: "2026-03-05T07:59:59.999Z",
      timezoneOffsetMinutes: 480,
    });
  });

  it("getCurrentLocalDayContext는 자정 경계에서 다음 로컬 날짜 범위로 전환한다", () => {
    const beforeMidnightContext = withTimezone("Asia/Seoul", () =>
      getCurrentLocalDayContext(new Date("2026-03-05T14:59:59.999Z")),
    );
    const afterMidnightContext = withTimezone("Asia/Seoul", () =>
      getCurrentLocalDayContext(new Date("2026-03-05T15:00:00.000Z")),
    );

    expect(beforeMidnightContext).toEqual({
      dateKey: "2026-03-05",
      dayStartAt: "2026-03-04T15:00:00.000Z",
      dayEndAt: "2026-03-05T14:59:59.999Z",
      timezoneOffsetMinutes: -540,
    });
    expect(afterMidnightContext).toEqual({
      dateKey: "2026-03-06",
      dayStartAt: "2026-03-05T15:00:00.000Z",
      dayEndAt: "2026-03-06T14:59:59.999Z",
      timezoneOffsetMinutes: -540,
    });
  });

  it("isValidLocalDayContext는 정상 범위를 검증한다", () => {
    expect(
      isValidLocalDayContext({
        dateKey: "2026-03-05",
        dayStartAt: "2026-03-04T15:00:00.000Z",
        dayEndAt: "2026-03-05T14:59:59.999Z",
        timezoneOffsetMinutes: -540,
      }),
    ).toBe(true);

    expect(
      isValidLocalDayContext({
        dateKey: "2026-03-04",
        dayStartAt: "invalid-date",
        dayEndAt: "2026-03-04T23:59:59.999Z",
        timezoneOffsetMinutes: 0,
      }),
    ).toBe(false);
  });

  it("isValidLocalDayContext는 DST로 23시간 또는 25시간이 된 로컬 날짜 범위를 허용한다", () => {
    const dstStartContext = withTimezone("America/Los_Angeles", () =>
      getCurrentLocalDayContext(new Date("2026-03-08T20:00:00.000Z")),
    );
    const dstEndContext = withTimezone("America/Los_Angeles", () =>
      getCurrentLocalDayContext(new Date("2026-11-01T20:00:00.000Z")),
    );

    expect(
      new Date(dstStartContext.dayEndAt).getTime() -
        new Date(dstStartContext.dayStartAt).getTime() +
        1,
    ).toBe(23 * 60 * 60 * 1000);
    expect(
      new Date(dstEndContext.dayEndAt).getTime() -
        new Date(dstEndContext.dayStartAt).getTime() +
        1,
    ).toBe(25 * 60 * 60 * 1000);
    expect(isValidLocalDayContext(dstStartContext)).toBe(true);
    expect(isValidLocalDayContext(dstEndContext)).toBe(true);
  });
});
