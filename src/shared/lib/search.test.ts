import { describe, expect, it } from "vitest";

import { sanitizeSearchQuery } from "./search";

describe("sanitizeSearchQuery", () => {
  it("빈 입력은 빈 문자열을 반환한다", () => {
    expect(sanitizeSearchQuery(undefined)).toBe("");
    expect(sanitizeSearchQuery(null)).toBe("");
    expect(sanitizeSearchQuery("")).toBe("");
  });

  it("앞뒤 공백을 제거한다", () => {
    expect(sanitizeSearchQuery("   hello world   ")).toBe("hello world");
  });

  it("최대 100자로 제한한다", () => {
    const longText = "a".repeat(120);
    expect(sanitizeSearchQuery(longText)).toHaveLength(100);
  });
});
