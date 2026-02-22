"use client";

import { Suspense } from "react";

import { AuthDialog } from "@/features/auth";
import { AuthProvider } from "@/entities/user";
import { PostHogPageViewTracker, PostHogProvider } from "@/shared/lib/posthog";
import { UserAuth } from "@/shared/types";
import { Toaster } from "@/shared/ui/sonner";

interface AppProviderProps {
  children: React.ReactNode;
  initialUser: UserAuth | null;
}

export function AppProvider({ children, initialUser }: AppProviderProps) {
  return (
    <PostHogProvider>
      <AuthProvider initialUser={initialUser}>
        <Suspense fallback={null}>
          <PostHogPageViewTracker />
        </Suspense>
        <Toaster />
        <Suspense fallback={null}>
          <AuthDialog />
        </Suspense>
        {children}
      </AuthProvider>
    </PostHogProvider>
  );
}
