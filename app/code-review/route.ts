const GONE_HEADERS = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Content-Type": "text/html; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

async function getCodeReviewGoneHtml(request: Request) {
  const gonePageUrl = new URL("/code-review-gone", request.url);
  const response = await fetch(gonePageUrl, {
    headers: {
      "x-code-review-gone-render": "1",
    },
    cache: "no-store",
  });

  return response.text();
}

export async function GET(request: Request) {
  return new Response(await getCodeReviewGoneHtml(request), {
    status: 410,
    headers: GONE_HEADERS,
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 410,
    headers: GONE_HEADERS,
  });
}
