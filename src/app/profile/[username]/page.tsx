import { UserProfilePage } from "@/widgets/user-profile-page";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const { tab } = await searchParams;

  return <UserProfilePage username={username} tab={tab} />;
}
