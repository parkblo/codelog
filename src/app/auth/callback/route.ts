import { NextResponse } from "next/server";

import { exchangeAuthCode } from "@/features/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const { error } = await exchangeAuthCode(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isDev = process.env.NODE_ENV === "development";
      if (isDev) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
