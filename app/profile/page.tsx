import { redirect } from "next/navigation";

import { ServerAuthService } from "@/shared/lib/auth/server-auth.service";
import { getAuthRedirectUrl } from "@/shared/lib/utils";

export default async function ProfilePage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect(getAuthRedirectUrl("/profile"));
  }

  redirect(`/profile/${user.username}`);
}
