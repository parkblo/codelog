"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/entities/user";
import { signOutAction } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { Button } from "@/shared/ui/button";

export function SignOutButton() {
  const { user } = useAuth();
  const router = useRouter();

  const signOut = async () => {
    await handleAction(signOutAction(), {
      actionName: "sign_out",
      onSuccess: () => {
        router.refresh();
        router.push("/");
      },
    });
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
