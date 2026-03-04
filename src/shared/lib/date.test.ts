import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateContributionData } from "./date";
import { formatRelativeTime } from "./date";

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
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
