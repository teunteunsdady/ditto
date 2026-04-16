"use client";

import { useEffect, useRef, useState } from "react";

import { RotatingVisual } from "@/components/rotating-visual";

const sections = [
  {
    id: "section-1",
    badge: "WELCOME TO COREGROUND",
    title: "당신의 관점을 바꾸는 새로운 시작",
    subtitle: "흔들림에서 중심으로, 다시 나를 세우는 코칭",
    description:
      "코어그라운드는 세상의 시선에 흔들리던 2030이 두 발을 단단히 딛고 설 수 있는 내면의 기준을 만듭니다.",
    points: ["브랜드 철학 기반 코칭", "자기 이해와 실행의 연결", "관계·감정·진로를 아우르는 성장 설계"],
  },
  {
    id: "section-2",
    badge: "OUR PHILOSOPHY",
    title: "조건보다, 그 조건으로 무엇을 해내는가",
    subtitle: "코어그라운드가 중요하게 생각하는 기준",
    description:
      "성장의 여정은 혼자서 완성되지 않습니다. 코어그라운드는 각자의 이야기와 가능성을 존중하며, 함께 변화를 만드는 관계를 지향합니다.",
    points: ["해석을 넘어 행동 변화로", "멘토-멘티 상호 성장 구조", "삶의 변화를 만드는 출발점 설계"],
  },
  {
    id: "section-3",
    badge: "OUR IMPACT",
    title: "숫자로 증명되는 코어그라운드 경험",
    subtitle: "축적된 운영 데이터와 실제 변화 사례",
    description:
      "지속적인 프로그램 운영을 통해 자기이해, 관계 역량, 실행력에서의 실제 변화를 함께 만들어 왔습니다.",
    points: ["누적 참여자 5,000+", "개설 프로그램 200+", "코칭/멘토링 시간 1,000+"],
  },
  {
    id: "section-4",
    badge: "WHY COREGROUND",
    title: "왜 코어그라운드인가",
    subtitle: "변화를 만드는 핵심 환경을 제공합니다",
    description:
      "단순한 진단 제공을 넘어, 개인 맞춤형 로드맵과 피드백 구조를 통해 일상 속 실행 변화가 유지되도록 돕습니다.",
    points: ["엄선된 고품질 코칭 콘텐츠", "성장을 돕는 커뮤니티", "개인 맞춤 성장 로드맵"],
  },
  {
    id: "section-5",
    badge: "PROGRAMS",
    title: "당신에게 맞는 코어 프로그램",
    subtitle: "개인과 그룹의 성장 단계에 맞춘 3가지 트랙",
    description:
      "퍼스널 코어, 그룹 코어, 새학기 온보딩 코칭으로 참여 대상과 목적에 따라 유연하게 설계됩니다.",
    points: ["퍼스널 코어 프로그램", "그룹 코어 프로그램", "새학기 온보딩 코칭"],
  },
  {
    id: "section-6",
    badge: "PROCESS",
    title: "진행 방식은 단순하고 명확합니다",
    subtitle: "사전상담 → 진단해석 → 코칭실행 → 리뷰",
    description:
      "참여자의 현재 상태를 정확히 이해한 뒤, 목적에 맞는 실행 전략을 함께 설계하고 점검합니다.",
    points: ["사전 상담", "진단 및 해석", "코칭 실행", "리뷰 및 후속 제안"],
  },
  {
    id: "section-7",
    badge: "START NOW",
    title: "망설일 이유가 없습니다",
    subtitle: "지금, 당신의 중심을 찾는 첫 대화를 시작하세요",
    description:
      "프로그램 목적과 참여 대상에 맞는 상담을 통해 가장 적합한 코어그라운드 코칭 흐름을 제안합니다.",
    points: ["개인/그룹 모두 상담 가능", "온라인/오프라인 운영 가능", "언제든 안내 가능한 상담 창구"],
  },
];

const stats = [
  { label: "누적 참여자", value: "5,000+" },
  { label: "개설 프로그램", value: "200+" },
  { label: "코칭 시간", value: "1,000+ 시간" },
];

const brandSignals = ["중심", "균형", "관계", "회복", "실행", "성장"];

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const mainRef = useRef<HTMLElement | null>(null);
  const activeSectionRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const bypassSnapTouchRef = useRef(false);

  const goToSection = (targetIndex: number) => {
    const root = mainRef.current;
    if (!root) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(sections.length - 1, targetIndex));
    if (nextIndex === activeSectionRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    root.scrollTo({
      top: nextIndex * root.clientHeight,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      isAnimatingRef.current = false;
    }, 650);
  };

  useEffect(() => {
    const root = mainRef.current;
    if (!root) {
      return;
    }

    const sectionsInView = root.querySelectorAll<HTMLElement>("[data-section-index]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const index = Number((entry.target as HTMLElement).dataset.sectionIndex ?? 0);
          setActiveSection(index);
          activeSectionRef.current = index;
        });
      },
      {
        root,
        threshold: 0.6,
      },
    );

    sectionsInView.forEach((section) => observer.observe(section));

    return () => {
      sectionsInView.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (isAnimatingRef.current || Math.abs(event.deltaY) < 8) {
        return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      goToSection(activeSectionRef.current + direction);
    };

    const onTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      bypassSnapTouchRef.current = Boolean(target?.closest('[data-allow-touch-pan="true"]'));
      if (bypassSnapTouchRef.current) {
        touchStartYRef.current = null;
        return;
      }
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (bypassSnapTouchRef.current) {
        return;
      }
      event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (bypassSnapTouchRef.current) {
        bypassSnapTouchRef.current = false;
        touchStartYRef.current = null;
        return;
      }
      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY;

      if (startY == null || endY == null || isAnimatingRef.current) {
        touchStartYRef.current = null;
        return;
      }

      const deltaY = startY - endY;
      if (Math.abs(deltaY) < 40) {
        touchStartYRef.current = null;
        return;
      }

      const direction = deltaY > 0 ? 1 : -1;
      goToSection(activeSectionRef.current + direction);
      touchStartYRef.current = null;
      bypassSnapTouchRef.current = false;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className="h-[calc(100dvh-10rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth sm:h-[calc(100dvh-9.5rem)]"
    >
      {sections.map((section, index) => (
        (() => {
          const isHero = index === 0;
          return (
        <section
          key={section.id}
          id={section.id}
          data-section-index={index}
          className="flex min-h-[calc(100dvh-10rem)] snap-start items-stretch px-2 py-4 transition-all duration-500 sm:min-h-[calc(100dvh-9.5rem)] sm:px-4 sm:py-6 lg:px-6"
        >
          <div
            className={`relative mx-auto grid max-h-[calc(100dvh-11rem)] w-full max-w-7xl overflow-y-auto gap-5 rounded-2xl border p-4 shadow-sm transition-all duration-500 sm:max-h-[calc(100dvh-10.5rem)] sm:rounded-3xl sm:gap-6 sm:p-8 lg:grid-cols-2 lg:gap-8 lg:p-12 ${
              isHero
                ? activeSection === index
                  ? "scale-100 grid-cols-1 gap-0 overflow-hidden border-[#ddd3c2] bg-[linear-gradient(140deg,#f8f4ec_0%,#eee4d4_45%,#f4eee1_100%)] p-0 opacity-100"
                  : "scale-[0.985] grid-cols-1 gap-0 overflow-hidden border-[#d5c8b2] bg-[#efe5d4] p-0 opacity-95"
                : activeSection === index
                  ? "scale-100 border-[#d6c8b1] bg-[#f4ecdd] opacity-100"
                  : "scale-[0.985] border-[#d1c2aa] bg-[#eee3cf] opacity-90"
            }`}
          >
            <div
              className={`pointer-events-none absolute -right-12 -top-8 h-32 w-32 rounded-full blur-3xl ${
                isHero ? "bg-[#7dc8aa]/35" : "bg-[#2f4f46]/10"
              }`}
            />
            <div
              className={`pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full blur-3xl ${
                isHero ? "bg-[#9ab0f4]/25" : "bg-[#c6a976]/20"
              }`}
            />

            <div className={isHero ? "hidden" : "relative z-10"}>
              <p
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  isHero
                    ? "border border-[#d9cfbf] bg-white/70 text-[#3f5f55]"
                    : "border border-[#cdbfa8] bg-[#e8dfcf] text-[#2f4f46]"
                }`}
              >
                {section.badge}
              </p>
              <h2
                className={`mt-3 text-2xl font-bold leading-tight tracking-tight transition-all duration-500 sm:text-3xl lg:text-4xl ${
                  activeSection === index ? "translate-y-0 opacity-100" : "translate-y-1 opacity-80"
                }`}
                style={isHero ? { color: "#1f3a33" } : undefined}
              >
                {section.title}
              </h2>
              <p
                className={`mt-2 text-base font-semibold sm:text-lg ${
                  isHero ? "text-[#3f5f55]" : "text-[#2f4f46]"
                }`}
              >
                {section.subtitle}
              </p>
              <p className={`mt-4 max-w-2xl text-base sm:text-lg ${isHero ? "text-[#5d6964]" : "text-[#56625d]"}`}>
                {section.description}
              </p>

              <ul className={`mt-5 space-y-2 text-sm ${isHero ? "text-[#4d5b56]" : "text-[#4d5b56]"}`}>
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${isHero ? "bg-[#2f7a63]" : "bg-[#2f4f46]"}`} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {index === 1 ? (
                <blockquote className="mt-6 rounded-xl border border-[#d8ccb6] bg-[#f8f2e6] px-4 py-3 text-sm italic text-[#4f5b57]">
                  “Not the senses I have but what I do with them is my kingdom.”
                  <span className="mt-2 block not-italic text-xs text-[#67736e]">
                    내가 가진 감각들이 아니라, 그것으로 하는 무엇인가가 나의 세계다.
                  </span>
                </blockquote>
              ) : null}

              {index === 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {brandSignals.map((signal, chipIndex) => (
                    <span
                      key={signal}
                      className="inline-flex rounded-full border border-[#c7baa3] bg-[#efe6d6] px-2.5 py-1 text-[11px] font-semibold text-[#41514c]"
                      style={{
                        animation: "cgFloat 3.6s ease-in-out infinite",
                        animationDelay: `${chipIndex * 0.12}s`,
                      }}
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              ) : null}

              {index === 2 ? (
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {stats.map((item) => (
                    <article
                      key={item.label}
                      className="rounded-lg border border-[#d8ccb6] bg-[#f8f2e6] px-3 py-3"
                    >
                      <p className="text-lg font-bold text-[#1f3a33]">{item.value}</p>
                      <p className="mt-1 text-xs text-[#5d6964]">{item.label}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={index === sections.length - 1 ? "/contact" : "/programs"}
                  className={`rounded-md px-5 py-2.5 text-sm font-medium text-white ${
                    isHero ? "bg-[#2f7a63] hover:bg-[#23614f]" : "bg-[#2f4f46] hover:bg-[#223c35]"
                  }`}
                >
                  {index === sections.length - 1 ? "상담 신청하기" : "프로그램 보기"}
                </a>
                <a
                  href="#section-1"
                  className={`rounded-md border px-5 py-2.5 text-sm font-medium ${
                    isHero
                      ? "border-[#cbbda6] text-[#3f4e48] hover:bg-[#e7decd]"
                      : "border-[#b9b29f] text-[#3f4e48] hover:bg-[#e7e2d4]"
                  }`}
                >
                  처음으로
                </a>
              </div>
              <p className={`mt-6 text-xs ${isHero ? "text-[#9d947f]" : "text-[#8e958e]"}`}>
                섹션 {index + 1} / {sections.length}
              </p>
            </div>

            <div className={`relative z-10 ${isHero ? "h-full min-h-[420px]" : "lg:pl-4"}`}>
              <RotatingVisual seed={index} fullBleed={isHero} />
              {isHero ? (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-wrap gap-2 sm:inset-x-6 sm:bottom-6">
                  <a
                    href="/programs"
                    className="pointer-events-auto rounded-md bg-[#2f7a63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#23614f]"
                  >
                    프로그램 보기
                  </a>
                  <a
                    href="/contact"
                    className="pointer-events-auto rounded-md border border-[#cbbda6] bg-white/75 px-4 py-2 text-sm font-semibold text-[#3f4e48] backdrop-blur hover:bg-white"
                  >
                    상담 문의
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#6e7872]">
                  코어그라운드 브랜드 무드(뮤트톤, 포레스트 그린, 샌드 베이지)를 반영한 비주얼 영역입니다.
                </p>
              )}
            </div>
          </div>
        </section>
          );
        })()
      ))}
    </main>
  );
}
