import type { Metadata } from "next";

import { ProfilePage } from "@/pages/profile";
import { UserService } from "@/entities/user/api/user.service";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({
  params,
}: Pick<ProfilePageProps, "params">): Promise<Metadata> {
  const { username } = await params;

  const userService = new UserService();
  const { data: user } = await userService.getUserByUsername(username);

  if (!user) {
    return {
      title: "CodeLog 프로필",
    };
  }

  const displayName = user.nickname || user.username;
  const description = user.bio || `${displayName}님의 CodeLog 프로필`;

  return {
    title: displayName,
    description,
    openGraph: {
      title: `${displayName} | CodeLog`,
      description,
      type: "profile",
      username: user.username,
    },
  };
}

export default async function Page({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const { tab } = await searchParams;

  return <ProfilePage username={username} tab={tab} />;
}
