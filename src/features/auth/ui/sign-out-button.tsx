"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/entities/user";
import { signOut as signOutFromClient, signOutAction } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { Button } from "@/shared/ui/button";

export function SignOutButton() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const signOut = async () => {
    const signOutResult = await handleAction(signOutAction(), {
      actionName: "sign_out",
    });

    if (signOutResult === null) {
      return;
    }

    updateUser(null);

    const { error: clientSignOutError } = await signOutFromClient();
    if (clientSignOutError) {
      console.error(clientSignOutError);
    }

    router.push("/home");
    router.refresh();
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
