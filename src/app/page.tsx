"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CompanyScrollSections } from "@/components/company-scroll-sections";
import { Button } from "@/components/ui/button";

const SESSION_LINKS = [
  { label: "소개", href: "#intro" },
  { label: "핵심 메시지", href: "#expertise-1" },
  { label: "비전", href: "#expertise-2" },
  { label: "일하는 방식", href: "#process" },
  // { label: "문의", href: "#cta" },
];

export default function Home() {
  const introRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const wheelCooldownRef = useRef(false);
  const [isVideoBlocked, setIsVideoBlocked] = useState(false);
  const scrollToAbout = useCallback(() => {
    const el = document.getElementById("expertise-1");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const isHeroDominant = useCallback(() => {
    const intro = introRef.current;
    if (!intro) return false;
    const rect = intro.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    if (vh <= 0) return false;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return visible / vh >= 0.72;
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 12) return;
      if (!isHeroDominant()) return;
      if (window.scrollY > 24) return;
      if (wheelCooldownRef.current) return;

      wheelCooldownRef.current = true;
      event.preventDefault();
      scrollToAbout();

      window.setTimeout(() => {
        wheelCooldownRef.current = false;
      }, 900);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY;
      touchStartYRef.current = null;
      if (startY == null || endY == null) return;

      const deltaY = startY - endY;
      if (deltaY < 48) return;
      if (!isHeroDominant()) return;
      if (window.scrollY > 24) return;
      if (wheelCooldownRef.current) return;

      wheelCooldownRef.current = true;
      scrollToAbout();
      window.setTimeout(() => {
        wheelCooldownRef.current = false;
      }, 900);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isHeroDominant, scrollToAbout]);

  useEffect(() => {
    let mounted = true;

    const tryAutoplay = async () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        video.muted = true;
        await video.play();
        if (mounted) setIsVideoBlocked(false);
      } catch {
        if (mounted) setIsVideoBlocked(true);
      }
    };

    void tryAutoplay();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    revealTargets.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${Math.min(index * 35, 280)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("cg-reveal-visible");
          } else {
            entry.target.classList.remove("cg-reveal-visible");
          }
        });
      },
      { threshold: 0.22, rootMargin: "-8% 0px -8% 0px" },
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative bg-[#f4f6fa] text-[#191f28]">
      <div className="pointer-events-none fixed right-2 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <nav className="pointer-events-auto rounded-xl border border-[#dde4ef] bg-white/90 p-1.5 backdrop-blur">
          <ul className="space-y-1">
            {SESSION_LINKS.map((session) => (
              <li key={session.href}>
                <a
                  href={session.href}
                  className="block rounded-md px-2.5 py-1.5 text-[11px] font-medium text-[#5b6573] transition-colors hover:bg-[#edf2fa] hover:text-[#191f28]"
                >
                  {session.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        <section
          id="intro"
          ref={introRef}
          className="relative overflow-hidden border-b border-[#edf0f5] bg-black"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setIsVideoBlocked(true)}
            onPlaying={() => setIsVideoBlocked(false)}
          >
            <source src="/videos/main-page.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,12,10,0.2),rgba(7,12,10,0.58))]" />
          {isVideoBlocked ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/45">
              <button
                type="button"
                onClick={async () => {
                  const video = videoRef.current;
                  if (!video) return;
                  try {
                    video.muted = true;
                    await video.play();
                    setIsVideoBlocked(false);
                  } catch {
                    setIsVideoBlocked(true);
                  }
                }}
                className="rounded-full border border-white/70 bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                배경 영상 재생
              </button>
            </div>
          ) : null}

          <div className="cg-container relative z-10 flex min-h-[calc(100svh-4rem)] flex-col py-12 sm:py-16">
            <div className="my-auto">
              <p className="text-sm font-semibold text-[#d5ece2]">FOUNDER&apos;S MANIFESTO</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                지금 CoreGround가 
                <br />
                왜 필요한가
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#e8f3ee] sm:text-lg">
                연결은 많아졌지만 내 기준은 더 쉽게 흔들립니다. CoreGround는 자기 이해를 넘어
                삶의 중심을 실제 행동으로 구축하는 코칭 경험을 설계합니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={scrollToAbout}
                  className="h-11 rounded-xl bg-[#2f4f46] px-6 text-white hover:bg-[#223c35]"
                >
                  CoreGround 알아보기
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-white/70 bg-white/10 px-6 text-white hover:bg-white/20"
                >
                  <Link href="/contact">문의하기</Link>
                </Button>
              </div>
            </div>

            <a
              href="#expertise-1"
              className="mx-auto mt-8 inline-flex h-6 w-6 items-center justify-center text-white/85 transition-colors hover:text-white"
              aria-label="다음 섹션으로 이동"
            >
              <span aria-hidden className="inline-block animate-bounce text-sm">↓</span>
            </a>
          </div>
        </section>

        <CompanyScrollSections includeIntroSection={false} includeContactSection={false} />
      </div>
    </main>
  );
}
