"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const MENUS = [
  { label: "코어 소개", href: "/" },
  { label: "프로그램", href: "/programs" },
  { label: "상담 문의", href: "/contact" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setIsLoggedIn(false);
    } catch {
      // noop
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d8d3c5] bg-[#f6f2e8]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 rounded bg-[#2f4f46] sm:h-8 sm:w-8" />
          <span className="truncate text-sm font-semibold text-[#1f3a33] sm:text-base">코어그라운드</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {MENUS.map((menu) => (
            <Link key={menu.href} href={menu.href} className="text-[#3f4e48] hover:text-[#1f3a33]">
              {menu.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link href="/admin" className="text-[#2f4f46] hover:text-[#1f3a33]">
              운영 대시보드
            </Link>
          ) : null}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-[#2f4f46] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#223c35]"
            >
              로그인
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-[#c8c1ae] p-2 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-4 bg-[#1f3a33]" />
            <span className="block h-0.5 w-4 bg-[#1f3a33]" />
            <span className="block h-0.5 w-4 bg-[#1f3a33]" />
          </span>
          <span className="sr-only">메뉴 토글</span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[#d8d3c5] bg-[#f6f2e8] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {MENUS.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="rounded-md px-2 py-2 text-sm text-[#3f4e48] hover:bg-[#ebe6d8]"
                onClick={() => setIsMenuOpen(false)}
              >
                {menu.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link
                href="/admin"
                className="rounded-md px-2 py-2 text-sm text-[#2f4f46] hover:bg-[#ebe6d8]"
                onClick={() => setIsMenuOpen(false)}
              >
                운영 대시보드
              </Link>
            ) : null}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-black px-3 py-2 text-left text-sm text-white hover:bg-neutral-800"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-[#2f4f46] px-3 py-2 text-sm text-white hover:bg-[#223c35]"
                onClick={() => setIsMenuOpen(false)}
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
