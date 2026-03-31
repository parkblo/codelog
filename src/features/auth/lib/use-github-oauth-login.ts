"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

import { signInWithOAuthAction } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { captureEvent } from "@/shared/lib/posthog";

function getOAuthRedirectTo(next: string | null) {
  const callbackPath = "/auth/callback";

  if (!next) {
    return `${window.location.origin}${callbackPath}`;
  }

  return `${window.location.origin}${callbackPath}?next=${encodeURIComponent(next)}`;
}

export function useGitHubOAuthLogin() {
  const searchParams = useSearchParams();
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const startGitHubOAuthLogin = useCallback(async () => {
    if (isGitHubLoading) {
      return;
    }

    captureEvent("auth_oauth_requested", { provider: "github" });

    setIsGitHubLoading(true);

    const data = await handleAction(
      signInWithOAuthAction("github", {
        redirectTo: getOAuthRedirectTo(searchParams?.get("next") ?? null),
      }),
      {
        actionName: "sign_in_with_oauth",
        onSuccess: (result) => {
          if (!result?.url) {
            return;
          }

          captureEvent("auth_oauth_redirected", { provider: "github" });
          window.location.href = result.url;
        },
        onError: () => {
          captureEvent("auth_oauth_failed", { provider: "github" });
        },
      },
    );

    if (!data?.url) {
      setIsGitHubLoading(false);
    }
  }, [isGitHubLoading, searchParams]);

  return { isGitHubLoading, startGitHubOAuthLogin };
}
