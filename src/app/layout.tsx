import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { LayoutShell } from "@/components/layout-shell";
import { RouteTransitionProvider } from "@/components/route-transition-provider";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="ko" className={cn("font-sans", inter.variable)}>
      <body className={cn(inter.className, "min-h-screen antialiased")}>
        <RouteTransitionProvider>
          <LayoutShell>{children}</LayoutShell>
        </RouteTransitionProvider>
      </body>
    </html>
  );
}
