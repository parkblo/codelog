"use client";

import { Button } from "@/shared/ui/button";
import { useAuth } from "@/app/providers/auth-provider";
import { ClientAuthService } from "@/entities/user";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const authService = new ClientAuthService();
  const { user } = useAuth();
  const router = useRouter();

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (error) {
      console.error(error);
    } else {
      router.push("/");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button variant="destructive" onClick={signOut}>
      로그아웃
    </Button>
  );
}
