"use client";

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
        <PostHogPageViewTracker />
        <Toaster />
        <AuthDialog />
        {children}
      </AuthProvider>
    </PostHogProvider>
  );
}
