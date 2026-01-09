"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  Bookmark,
  Hash,
  Home,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface NavigationProps {
  hideLogo?: boolean;
}

export default function Navigation({ hideLogo = false }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  const handleRouteClick = (item: (typeof navItems)[0]) => {
    if (item.isAuthRequired && !user) {
      openAuthModal("login");
      return;
    }
    router.push(`/${item.page}`);
  };

  /* notification은 추후 추가 예정 */
  const navItems = [
    { icon: Home, label: "홈", page: "home", isAuthRequired: false },
    { icon: Hash, label: "탐색", page: "explore", isAuthRequired: false },
    {
      icon: MessageSquare,
      label: "코드 리뷰",
      page: "code-review",
      isAuthRequired: false,
    },
    {
      icon: Bookmark,
      label: "저장됨",
      page: "bookmarks",
      isAuthRequired: true,
    },
    {
      icon: User,
      label: "프로필",
      page: user ? `profile/${user.username}` : "profile",
      isAuthRequired: true,
    },
    { icon: Settings, label: "설정", page: "settings", isAuthRequired: true },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {!hideLogo && (
        <h1
          className="text-xl px-2 cursor-pointer"
          onClick={() => router.push("/home")}
        >
          CodeLog
        </h1>
      )}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          return (
            <Button
              key={item.label}
              variant={pathname === `/${item.page}` ? "default" : "ghost"}
              className="justify-start px-4 py-6"
              onClick={() => handleRouteClick(item)}
            >
              <item.icon />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
