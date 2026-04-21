"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const MENUS = [
  { label: "홈", href: "/" },
  { label: "소개", href: "/company" },
  { label: "프로그램", href: "/programs" },
  { label: "상담 문의", href: "/contact" },
];

export function SiteHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });
        const data = (await response.json()) as { authenticated?: boolean };
        setIsLoggedIn(Boolean(data.authenticated));
      } catch {
        setIsLoggedIn(false);
      }
    };

    void checkSession();

    const handleWindowFocus = () => {
      void checkSession();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [pathname]);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
    } catch {
      // noop
    }
    setIsSheetOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e5e8ee] bg-white/92 backdrop-blur supports-[backdrop-filter]:bg-white/78">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
            <Image
              src="/images/coreground-logo.png"
              alt="코어그라운드 로고"
              fill
              sizes="44px"
              className="object-contain"
              priority
            />
          </div>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-semibold tracking-tight text-[#191f28] sm:text-base">
              CoreGround
            </span>
            <span className="mt-1 hidden truncate text-[10px] font-medium tracking-[0.14em] text-[#6b7684] sm:block">
              COACHING INTELLIGENCE LAB
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 rounded-full border border-[#edf0f5] bg-[#f9fafc] p-1 text-sm md:flex">
          {MENUS.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`rounded-full px-4 py-2 font-medium transition-colors ${
                pathname === menu.href
                  ? "bg-white text-[#191f28] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                  : "text-[#4e5968] hover:text-[#191f28]"
              }`}
            >
              {menu.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 font-medium transition-colors ${
                pathname === "/admin"
                  ? "bg-white text-[#191f28] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                  : "text-[#4e5968] hover:text-[#191f28]"
              }`}
            >
              운영 대시보드
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleLogout}
              className="rounded-full bg-[#191f28] px-4 text-white hover:bg-[#11151d]"
            >
              로그아웃
            </Button>
          ) : (
            <Button asChild variant="default" size="sm" className="rounded-full bg-[#2f4f46] px-4 text-white hover:bg-[#223c35]">
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger → Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-[#d6dbe5] bg-white text-[#191f28] hover:bg-[#f2f4f8] md:hidden"
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 border-[#e5e8ee] bg-white">
            <SheetHeader>
              <SheetTitle className="text-[#191f28]">메뉴</SheetTitle>
            </SheetHeader>

            <Separator className="my-2" />

            <nav className="flex flex-col gap-1 pt-2">
              {MENUS.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === menu.href
                      ? "bg-[#f2f4f8] text-[#191f28]"
                      : "text-[#4e5968] hover:bg-[#f2f4f8]"
                  }`}
                  onClick={() => setIsSheetOpen(false)}
                >
                  {menu.label}
                </Link>
              ))}

              {isLoggedIn && (
                <Link
                  href="/admin"
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === "/admin"
                      ? "bg-[#f2f4f8] text-[#191f28]"
                      : "text-[#4e5968] hover:bg-[#f2f4f8]"
                  }`}
                  onClick={() => setIsSheetOpen(false)}
                >
                  운영 대시보드
                </Link>
              )}
            </nav>

            <Separator className="my-3" />

            <div className="px-1">
              {isLoggedIn ? (
                <Button
                  variant="default"
                  className="w-full rounded-xl bg-[#191f28] text-white hover:bg-[#11151d]"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              ) : (
                <Button asChild variant="default" className="w-full rounded-xl bg-[#2f4f46] text-white hover:bg-[#223c35]">
                  <Link
                    href="/login"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    로그인
                  </Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
