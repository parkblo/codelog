import { describe, expect, it } from "vitest";

import { getAuthRedirectUrl, getPathWithSearch } from "./auth";

describe("getAuthRedirectUrl", () => {
  it("검색 파라미터가 포함된 next 경로를 그대로 유지한다", () => {
    const nextPath = getPathWithSearch("/search", "?q=react&tag=til");

    expect(nextPath).toBe("/search?q=react&tag=til");
    expect(getAuthRedirectUrl(nextPath)).toBe(
      "/?auth=required&next=%2Fsearch%3Fq%3Dreact%26tag%3Dtil",
    );
  });

  it("동적 프로필 경로를 안전하게 유지한다", () => {
    const nextPath = "/profile/parkblo-dev";

    expect(getAuthRedirectUrl(nextPath)).toBe(
      "/?auth=required&next=%2Fprofile%2Fparkblo-dev",
    );
  });

  it("절대 URL 형태의 next 값은 홈으로 정규화한다", () => {
    expect(getAuthRedirectUrl("https://evil.example")).toBe(
      "/?auth=required&next=%2Fhome",
    );
    expect(getAuthRedirectUrl("//evil.example")).toBe(
      "/?auth=required&next=%2Fhome",
    );
  });
});
