import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line import/no-internal-modules
import { GET, HEAD } from "../app/code-review/route";

describe("app/code-review/route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GET 요청에 안내 HTML과 410 상태를 반환한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html><body>gone</body></html>", {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      }),
    );

    const request = new Request("https://example.com/code-review");
    const response = await GET(request);
    const html = await response.text();

    expect(response.status).toBe(410);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(html).toContain("gone");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("/code-review-gone", request.url),
      {
        cache: "no-store",
        headers: {
          "x-code-review-gone-render": "1",
        },
      },
    );
  });

  it("HEAD 요청에 410 상태를 반환한다", async () => {
    const response = await HEAD();
    const body = await response.text();

    expect(response.status).toBe(410);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(body).toBe("");
  });
});
