"use client";

import { Suspense } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthDialog } from "@/features/auth";
import { AuthProvider } from "@/entities/user";
import { PostHogPageViewTracker, PostHogProvider } from "@/shared/lib/posthog";
import { UserAuth } from "@/shared/types";
import { Toaster } from "@/shared/ui/sonner";

interface AppProviderProps {
  children: React.ReactNode;
  initialUser: UserAuth | null;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

export function AppProvider({ children, initialUser }: AppProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
