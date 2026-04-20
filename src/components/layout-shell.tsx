"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type LayoutShellProps = {
  children: React.ReactNode;
};

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <>
      <SiteHeader />
      <div className="pt-16">{children}</div>
      <SiteFooter />
    </>
  );
}
