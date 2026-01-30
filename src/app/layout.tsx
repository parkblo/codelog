import type { Metadata } from "next";
import localFont from "next/font/local";

import { Header } from "@/widgets/header";
import { MobileNav } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";
import { AuthDialog } from "@/features/auth";
import { AuthProvider, ServerAuthService } from "@/entities/user";
import { BackgroundMesh } from "@/shared/ui/background-mesh";
import { Toaster } from "@/shared/ui/sonner";

import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/pretendard/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "CodeLog",
  description: "우리 코드로 이야기 나눠요.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  return (
    <html lang="ko" className="dark">
      <body className={`${pretendard.variable} antialiased`}>
        <AuthProvider initialUser={user}>
          <Toaster />
          <AuthDialog />
          <BackgroundMesh />
          <MobileNav />

          <div className="grid min-h-screen grid-cols-1 md:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_320px] max-w-7xl mx-auto">
            <aside className="hidden md:block">
              <Header />
            </aside>
            <main className="relative">{children}</main>
            <aside className="hidden xl:block">
              <Sidebar />
            </aside>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
