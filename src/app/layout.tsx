import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ditto's templates",
  description: "Next.js + Supabase 기반 코칭 서비스 웹사이트 스타터",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          <SiteHeader />
          <div className="pt-16">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
