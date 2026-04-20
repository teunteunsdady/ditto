"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RouteTransitionProviderProps = {
  children: React.ReactNode;
};

export function RouteTransitionProvider({ children }: RouteTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLeaving, setIsLeaving] = useState(false);
  const navigatingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const navigateWithTransition = useCallback(
    (target: string) => {
      if (navigatingRef.current) {
        return;
      }

      navigatingRef.current = true;
      setIsLeaving(true);
      timeoutRef.current = window.setTimeout(() => {
        router.push(target);
      }, 420);
    },
    [router],
  );

  useEffect(() => {
    if (!navigatingRef.current) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setIsLeaving(false);
      navigatingRef.current = false;
    }, 80);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) {
        return;
      }

      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      if (current === next) {
        return;
      }

      event.preventDefault();
      navigateWithTransition(next);
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [navigateWithTransition]);

  return (
    <div className={cn("route-stage", isLeaving && "route-stage-leaving")}>
      {children}
    </div>
  );
}
