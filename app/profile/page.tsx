import { redirect } from "next/navigation";

import { requireAuth } from "@/features/auth/server";

export default async function ProfilePage() {
  const user = await requireAuth("/profile");
  redirect(`/profile/${user.username}`);
}
