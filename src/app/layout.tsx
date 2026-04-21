import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { LayoutShell } from "@/components/layout-shell";
import { RouteTransitionProvider } from "@/components/route-transition-provider";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CoreGround | Coaching Intelligence Lab",
  description:
    "CoreGround는 흔들리지 않는 내적 기준을 만드는 코칭 인텔리전스 랩입니다.",
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
