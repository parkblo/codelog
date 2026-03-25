import { describe, expect, it } from "vitest";

import {
  CODELOG_BASE_URL,
  getAbsoluteUrl,
  getPostPath,
  getPostSeoDescription,
  getPostSeoTitle,
  getPostStructuredData,
} from "./seo";

describe("seo helpers", () => {
  it("description이 있으면 우선 사용한다", () => {
    expect(
      getPostSeoDescription({
        description: "  오늘 배운 점 정리  ",
        content: "content",
      }),
    ).toBe("오늘 배운 점 정리");
  });

  it("description이 없으면 content를 정규화한 뒤 발췌한다", () => {
    const result = getPostSeoDescription({
      description: "   ",
      content: `첫 줄\n둘째 줄 ${"x".repeat(200)}`,
    });

    expect(result.startsWith("첫 줄 둘째 줄 ")).toBe(true);
    expect(result.endsWith("...")).toBe(true);
    expect(result).toHaveLength(153);
  });

  it("포스트 구조화 데이터를 생성한다", () => {
    const structuredData = getPostStructuredData({
      id: 77,
      description: "오늘 배운 점",
      content: "내용",
      created_at: "2026-03-25T00:00:00.000Z",
      updated_at: null,
      language: "typescript",
      tags: ["til", "nextjs"],
      author: {
        username: "parkblo",
        nickname: "Park",
      },
    });

    expect(getPostPath(77)).toBe("/post/77");
    expect(getAbsoluteUrl("/post/77")).toBe(`${CODELOG_BASE_URL}/post/77`);
    expect(getPostSeoTitle({ author: { username: "parkblo", nickname: "Park" } })).toBe(
      "Park의 오늘 기록",
    );
    expect(structuredData).toMatchObject({
      "@type": "Article",
      headline: "Park의 오늘 기록",
      mainEntityOfPage: `${CODELOG_BASE_URL}/post/77`,
      articleSection: "typescript",
      keywords: "til, nextjs",
    });
  });
});
