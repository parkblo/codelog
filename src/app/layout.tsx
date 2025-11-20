import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Sidebar from "@/components/layout/Sidebar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${pretendard.variable} antialiased`}>
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_320px] max-w-6xl mx-auto">
          <aside className="hidden md:block">
            <Navigation />
          </aside>
          <main>{children}</main>
          <aside className="hidden xl:block">
            <Sidebar />
          </aside>
        </div>
      </body>
    </html>
  );
}
