"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const MENUS = [
  { label: "서비스 안내", href: "/" },
  { label: "프로그램 안내", href: "/programs" },
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-600" />
          <span className="font-semibold">LOGO</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {MENUS.map((menu) => (
            <Link key={menu.href} href={menu.href} className="text-gray-700 hover:text-gray-900">
              {menu.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link href="/admin" className="text-blue-600 hover:text-blue-700">
              운영 대시보드
            </Link>
          ) : null}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              로그인
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border p-2 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-4 bg-gray-900" />
            <span className="block h-0.5 w-4 bg-gray-900" />
            <span className="block h-0.5 w-4 bg-gray-900" />
          </span>
          <span className="sr-only">메뉴 토글</span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {MENUS.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {menu.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link
                href="/admin"
                className="rounded-md px-2 py-2 text-sm text-blue-600 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                운영 대시보드
              </Link>
            ) : null}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border px-3 py-2 text-sm text-left hover:bg-gray-100"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white"
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
