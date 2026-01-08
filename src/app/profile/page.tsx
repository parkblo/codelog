import { ServerAuthService } from "@/services/auth/server-auth.service";
import { redirect } from "next/navigation";
import { getAuthRedirectUrl } from "@/utils/auth-helpers";

export default async function ProfilePage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect(getAuthRedirectUrl("/profile"));
  }

  redirect(`/profile/${user.username}`);
}
