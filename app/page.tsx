import { redirect } from "next/navigation";

import { LandingPage } from "@/pages/landing";
import { getCurrentUser } from "@/entities/user/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/home");
  }

  return <LandingPage />;
}
