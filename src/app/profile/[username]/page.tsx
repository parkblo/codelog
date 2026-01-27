import { ProfilePage } from "@/widgets/profile-page";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const { tab } = await searchParams;

  return <ProfilePage username={username} tab={tab} />;
}
