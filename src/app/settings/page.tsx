import SignOutButton from "./_components/SignOutButton";
import { redirect } from "next/navigation";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import { getAuthRedirectUrl } from "@/utils/auth";

export default async function SettingsPage() {
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
