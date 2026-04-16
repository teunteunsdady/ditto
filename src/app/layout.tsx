import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "코어그라운드 | CoreGround",
  description:
    "타인에게 흔들리지 않는 가장 깊은 단단한 중심을 만드는 코칭 프로젝트, 코어그라운드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <div className="min-h-screen bg-[var(--core-base-bg)]">
          <SiteHeader />
          <div className="pt-16">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
