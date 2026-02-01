import { SignOutButton } from "@/features/auth";
import { requireAuth } from "@/features/auth/server";

export async function SettingsPage() {
  await requireAuth("/settings");

  return (
    <div className="p-4 space-y-4">
      <SignOutButton />
    </div>
  );
}
