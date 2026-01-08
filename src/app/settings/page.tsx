import SignOutButton from "./_components/SignOutButton";
import { redirect } from "next/navigation";
import { ServerAuthService } from "@/services/auth/server-auth.service";

export default async function SettingsPage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect("/home/?auth=required&next=/settings");
  }

  return (
    <div className="p-4 space-y-4">
      <SignOutButton />
    </div>
  );
}
