"use client";

import { AuthProvider } from "@/entities/user";
import { AuthDialog } from "@/features/auth";
import { UserAuth } from "@/shared/types";
import { Toaster } from "@/shared/ui/sonner";

interface AppProviderProps {
  children: React.ReactNode;
  initialUser: UserAuth | null;
}

export function AppProvider({ children, initialUser }: AppProviderProps) {
  return (
    <AuthProvider initialUser={initialUser}>
      <Toaster />
      <AuthDialog />
      {children}
    </AuthProvider>
  );
}
