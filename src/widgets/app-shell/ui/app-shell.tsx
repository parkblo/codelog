"use client";

import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  mobileNav: React.ReactNode;
  sidebar: React.ReactNode;
}

function isLandingPath(pathname: string | null) {
  return pathname === "/";
}

export function AppShell({
  children,
  header,
  mobileNav,
  sidebar,
}: AppShellProps) {
  const pathname = usePathname();

  if (isLandingPath(pathname)) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      {mobileNav}
      <div className="grid min-h-screen grid-cols-1 max-w-7xl mx-auto md:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_320px]">
        <aside className="hidden md:block">{header}</aside>
        <main className="relative">{children}</main>
        <aside className="hidden xl:block">{sidebar}</aside>
      </div>
    </>
  );
}
