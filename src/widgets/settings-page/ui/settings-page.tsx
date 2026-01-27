import { SignOutButton } from "@/features/auth";
import { redirect } from "next/navigation";
import { ServerAuthService } from "@/entities/user/api/server-auth.service";
import { getAuthRedirectUrl } from "@/shared/lib/utils/auth";

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
