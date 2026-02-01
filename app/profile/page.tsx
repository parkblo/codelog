import { redirect } from "next/navigation";

import { requireAuth } from "@/features/auth/index.server-only";

export default async function ProfilePage() {
  const user = await requireAuth("/profile");
  redirect(`/profile/${user.username}`);
}
