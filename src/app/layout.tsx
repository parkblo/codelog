import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/providers/auth-provider";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import { Toaster } from "@/components/ui/sonner";

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
          <div className="grid min-h-screen grid-cols-1 md:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_320px] max-w-6xl mx-auto">
            <aside className="hidden md:block">
              <Navigation />
            </aside>
            <main>{children}</main>
            <aside className="hidden xl:block">
              <Sidebar />
            </aside>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
