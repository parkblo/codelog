import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isDev = process.env.NODE_ENV === "development";

      const cookieStore = await cookies();
      const redirectOrigin = cookieStore.get("redirect_origin")?.value;
      if (redirectOrigin) {
        cookieStore.delete("redirect_origin");
      }

      if (redirectOrigin) {
        return NextResponse.redirect(`${redirectOrigin}${next}`);
      } else if (isDev) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (process.env.NEXT_PUBLIC_SITE_URL) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}${next}`
        );
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
