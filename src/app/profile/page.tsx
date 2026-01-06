import { ServerAuthService } from "@/services/auth/server-auth.service";
import { notFound, redirect } from "next/navigation";

export default async function ProfilePage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    notFound();
  }

  redirect(`/profile/${user.username}`);
}
