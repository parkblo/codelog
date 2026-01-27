import { ServerAuthService } from "@/entities/user/api/server-auth.service";
import { redirect } from "next/navigation";
import { getAuthRedirectUrl } from "@/shared/lib/utils/auth";

export default async function ProfilePage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect(getAuthRedirectUrl("/profile"));
  }

  redirect(`/profile/${user.username}`);
}
