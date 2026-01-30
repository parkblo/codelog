"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function ProfileTabs({ username }: { username: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "posts";

  const handleTabChange = (value: string) => {
    router.push(`/profile/${username}?tab=${value}`);
  };

  return (
    <Tabs
      defaultValue={currentTab}
      value={currentTab}
      onValueChange={handleTabChange}
      className="w-full "
    >
      <TabsList className="w-full">
        <TabsTrigger value="posts">게시글</TabsTrigger>
        <TabsTrigger value="likes">좋아요</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
