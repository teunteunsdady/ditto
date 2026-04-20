"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

const SESSION_LINKS = [
  { label: "소개", href: "#intro" },
  { label: "핵심 기능", href: "#features" },
  { label: "프로그램", href: "#programs" },
  { label: "상담 시작", href: "#cta" },
];

export default function Home() {
  const introRef = useRef<HTMLElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const wheelCooldownRef = useRef(false);

  const scrollToFeatures = useCallback(() => {
    const el = document.getElementById("features");
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
      scrollToFeatures();

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
      scrollToFeatures();
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
  }, [isHeroDominant, scrollToFeatures]);

  return (
    <main className="relative bg-[#f9fafb] text-[#191f28]">
      <div className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <nav className="pointer-events-auto rounded-2xl border border-[#e5e8ee] bg-white/90 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <ul className="space-y-1">
            {SESSION_LINKS.map((session) => (
              <li key={session.href}>
                <a
                  href={session.href}
                  className="block rounded-lg px-3 py-2 text-xs font-medium text-[#4e5968] transition-colors hover:bg-[#f2f4f8] hover:text-[#191f28]"
                >
                  {session.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="snap-y snap-proximity">
        <section
          id="intro"
          ref={introRef}
          className="snap-start relative overflow-hidden border-b border-[#edf0f5] bg-black"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/main-page.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,12,10,0.2),rgba(7,12,10,0.58))]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl flex-col px-4 py-16 sm:px-6 sm:py-20">
            <div className="my-auto">
              <p className="text-sm font-semibold text-[#d5ece2]">코어그라운드 소개</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                내 기준을 분명히 세우는
                <br />
                가장 실용적인 코칭 플랫폼
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#e8f3ee] sm:text-lg">
                자기 이해부터 실행 습관까지 한 번에 설계합니다. 개인 코칭, 그룹 프로그램, 진단
                리포트를 하나의 흐름으로 연결해 목표 달성까지 빠르게 이끕니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="h-11 rounded-xl bg-[#2f4f46] px-6 text-white hover:bg-[#223c35]">
                  <Link href="/programs">프로그램 시작하기</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-white/70 bg-white/10 px-6 text-white hover:bg-white/20"
                >
                  <Link href="/contact">1:1 상담 문의</Link>
                </Button>
              </div>
            </div>

            <a
              href="#features"
              className="mx-auto mt-8 inline-flex h-6 w-6 items-center justify-center text-white/85 transition-colors hover:text-white"
              aria-label="다음 섹션으로 이동"
            >
              <span aria-hidden className="inline-block animate-bounce text-sm">↓</span>
            </a>
          </div>
        </section>

        <section id="features" className="snap-start border-b border-[#edf0f5] bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
            <p className="text-sm font-semibold text-[#2f4f46]">핵심 기능</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "코어 진단",
                  desc: "현재 상태를 빠르게 진단하고 우선순위를 분명하게 정리합니다.",
                },
                {
                  title: "맞춤 코칭",
                  desc: "상황별 행동 계획을 세워 실행률 높은 루틴으로 연결합니다.",
                },
                {
                  title: "성과 리포트",
                  desc: "주차별 변화와 성과를 확인해 개선 포인트를 명확히 파악합니다.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#e5e8ee] bg-[#fcfdff] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  <h2 className="text-xl font-semibold text-[#191f28]">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#4e5968]">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="programs" className="snap-start border-b border-[#edf0f5] bg-[#f7f9fc]">
          <div className="mx-auto grid min-h-[74svh] w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#2f4f46]">프로그램 하이라이트</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                목적에 맞게 선택하는
                <br />
                CoreGround 코칭 트랙
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4e5968]">
                입문자를 위한 스타터, 실행력 강화 중심의 액셀러레이터, 리더 대상 인텐시브 코칭까지
                단계별로 제공합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e5e8ee] bg-white p-6">
              <ul className="space-y-4 text-sm text-[#333d4b]">
                <li className="flex items-start justify-between gap-3 border-b border-[#e8ebf0] pb-3">
                  <span>Starter Program</span>
                  <span className="font-semibold text-[#191f28]">4주</span>
                </li>
                <li className="flex items-start justify-between gap-3 border-b border-[#e8ebf0] pb-3">
                  <span>Accelerator Program</span>
                  <span className="font-semibold text-[#191f28]">8주</span>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <span>Leadership Intensive</span>
                  <span className="font-semibold text-[#191f28]">12주</span>
                </li>
              </ul>
              <Button asChild className="mt-6 h-10 w-full rounded-xl bg-[#191f28] text-white hover:bg-[#11151d]">
                <Link href="/programs">전체 프로그램 보기</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="cta" className="snap-start bg-[#f9fafb]">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="rounded-3xl bg-[#2f4f46] px-6 py-10 text-white sm:px-10 sm:py-12">
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
                지금 코어를 점검하고 다음 행동을 시작해보세요.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#e5efe9] sm:text-base">
                무료 사전 상담에서 현재 고민을 정리하고 가장 잘 맞는 시작 방법을 안내해드립니다.
              </p>
              <Button asChild className="mt-7 h-11 rounded-xl bg-white px-6 text-[#223c35] hover:bg-[#f2f4f8]">
                <Link href="/contact">무료 상담 예약</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
