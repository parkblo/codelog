import { NextResponse } from "next/server";

import { exchangeAuthCode, getCallbackRedirectUrl } from "@/features/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const { error } = await exchangeAuthCode(code);

    if (!error) {
      const redirectUrl = getCallbackRedirectUrl({
        origin,
        next,
        forwardedHost: request.headers.get("x-forwarded-host"),
      });
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
