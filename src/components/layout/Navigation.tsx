"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  Bell,
  Bookmark,
  Hash,
  Home,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";

export default function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleRouteClick = (path: string) => {
    router.push(`/${path}`);
  };

  const navItems = [
    { icon: Home, label: "홈", page: "home" },
    { icon: Hash, label: "탐색", page: "explore" },
    { icon: MessageSquare, label: "코드 리뷰", page: "code-review" },
    { icon: Bell, label: "알림", page: "notification" },
    { icon: Bookmark, label: "저장됨", page: "bookmarks" },
    { icon: User, label: "프로필", page: "profile" },
    { icon: Settings, label: "설정", page: "settings" },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1
        className="text-xl px-2 cursor-pointer"
        onClick={() => handleRouteClick("home")}
      >
        CodeLog
      </h1>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={pathname === `/${item.page}` ? "default" : "ghost"}
            className="justify-start px-4 py-6"
            onClick={() => handleRouteClick(item.page)}
          >
            <item.icon />
            <span>{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
