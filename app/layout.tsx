import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/widgets/app-shell";
import { Header, MobileNav } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";
import { getCurrentUser } from "@/entities/user/server";
import { BackgroundCanvas } from "@/shared/ui/background-canvas";

import { AppProvider } from "./providers";

import "@/shared/styles/globals.css";

const pretendard = localFont({
  src: "../public/fonts/pretendard/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: {
    default: "CodeLog",
    template: "%s | CodeLog",
  },
  description: "하루 한 줄, 성장이 쌓이는 곳.",
  metadataBase: new URL("https://codelog.vercel.app"),
  openGraph: {
    title: "CodeLog",
    description: "하루 한 줄, 성장이 쌓이는 곳.",
    type: "website",
    locale: "ko_KR",
    siteName: "CodeLog",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeLog",
    description: "하루 한 줄, 성장이 쌓이는 곳.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="ko" className="dark">
      <body className={`${pretendard.variable} antialiased`}>
        <AppProvider initialUser={user}>
          <BackgroundCanvas />
          <AppShell
            mobileNav={<MobileNav />}
            header={<Header />}
            sidebar={<Sidebar />}
          >
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
