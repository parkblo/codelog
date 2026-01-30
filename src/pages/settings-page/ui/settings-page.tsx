import { redirect } from "next/navigation";

import { SignOutButton } from "@/features/auth";
import { ServerAuthService } from "@/entities/user";
import { getAuthRedirectUrl } from "@/shared/lib/utils";

export async function SettingsPage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect(getAuthRedirectUrl("/settings"));
  }

  return (
    <div className="p-4 space-y-4">
      <SignOutButton />
    </div>
  );
}
