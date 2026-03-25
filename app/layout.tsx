import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/widgets/app-shell";
import { Header, MobileNav } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";
import { getCurrentUser } from "@/entities/user/server";
import {
  CODELOG_BASE_URL,
  CODELOG_DEFAULT_DESCRIPTION,
} from "@/shared/lib/seo";
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
  description: CODELOG_DEFAULT_DESCRIPTION,
  metadataBase: new URL(CODELOG_BASE_URL),
  openGraph: {
    title: "CodeLog",
    description: CODELOG_DEFAULT_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: "CodeLog",
    url: CODELOG_BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeLog",
    description: CODELOG_DEFAULT_DESCRIPTION,
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
