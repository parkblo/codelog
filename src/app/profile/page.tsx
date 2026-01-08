import { ServerAuthService } from "@/services/auth/server-auth.service";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect("/home/?auth=required&next=/profile");
  }

  redirect(`/profile/${user.username}`);
}
