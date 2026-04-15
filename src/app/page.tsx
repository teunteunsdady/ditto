"use client";

import { useEffect, useRef, useState } from "react";

import { RotatingVisual } from "@/components/rotating-visual";

const sections = [
  {
    id: "section-1",
    badge: "WELCOME TO COREGROUND",
    title: "흔들리지 않는 중심을 세우는 코칭 프로젝트",
    subtitle: "타인에게 흔들리지 않는 가장 깊은 단단한 중심",
    description: "세상의 시선에 흔들리던 2030이 두 발을 단단히 딛고 설 수 있는 ‘나’를 만듭니다.",
    points: ["개인·그룹 맞춤형 코칭 설계", "진단 기반 자기이해 강화", "실행 가능한 변화 루틴 정착"],
  },
  {
    id: "section-2",
    badge: "OUR PHILOSOPHY",
    title: "조건보다, 그 조건으로 무엇을 해내는가",
    subtitle: "마음의 중심을 찾는 성장 여정",
    description: "코어그라운드는 해석에서 멈추지 않습니다. 진단 결과를 삶의 행동 변화로 연결합니다.",
    points: ["자기 감정·사고 패턴 재해석", "관계 속 반응 패턴 점검", "개인 기준점(코어) 재정립"],
  },
  {
    id: "section-3",
    badge: "OUR IMPACT",
    title: "숫자로 증명되는 코칭 경험",
    subtitle: "축적된 운영 데이터와 실제 변화 사례",
    description:
      "누적된 프로그램 운영 경험을 바탕으로 참가자의 자기이해와 관계 변화에 집중합니다.",
    points: ["누적 참여자 5,000+", "개설 프로그램 200+", "코칭/멘토링 시간 1,000+"],
  },
  {
    id: "section-4",
    badge: "WHY COREGROUND",
    title: "변화를 만드는 3가지 핵심 요소",
    subtitle: "콘텐츠·코칭·커뮤니티의 유기적 결합",
    description:
      "단순한 진단 제공이 아니라, 참가자가 일상 속에서 변화를 유지할 수 있는 구조를 설계합니다.",
    points: ["엄선된 도구 기반 코칭", "개인 맞춤 성장 로드맵", "지속 가능한 실행 피드백"],
  },
  {
    id: "section-5",
    badge: "PROGRAMS",
    title: "코어그라운드 대표 프로그램",
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
    title: "상담 문의",
    subtitle: "당신의 중심을 찾는 첫 대화",
    description:
      "프로그램 목적과 참여 대상에 맞는 상담을 통해 가장 적합한 코어그라운드 코칭 흐름을 제안합니다.",
    points: ["개인/그룹 모두 상담 가능", "온라인/오프라인 운영 가능", "초기 진단 설계 지원"],
  },
];

const stats = [
  { label: "누적 참여자", value: "5,000+" },
  { label: "개설 프로그램", value: "200+" },
  { label: "코칭 시간", value: "1,000+ 시간" },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const mainRef = useRef<HTMLElement | null>(null);
  const activeSectionRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

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
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
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
      className="h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth"
    >
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          data-section-index={index}
          className="flex min-h-[calc(100dvh-4rem)] snap-start items-center px-2 py-6 transition-all duration-500 sm:px-4 lg:px-6"
        >
          <div
            className={`mx-auto grid w-full max-w-[1280px] gap-5 rounded-2xl border p-4 shadow-sm transition-all duration-500 sm:rounded-3xl sm:gap-6 sm:p-8 lg:grid-cols-2 lg:gap-8 lg:p-12 ${
              activeSection === index
                ? "scale-100 border-[#c6d3cb] bg-[#f6f2e8] opacity-100"
                : "scale-[0.985] border-[#d8d3c5] bg-[#f0ece2] opacity-70"
            }`}
          >
            <div>
              <p className="inline-flex rounded-full border border-[#b8c7bf] bg-[#e4ece7] px-3 py-1 text-xs font-semibold text-[#2f4f46]">
                {section.badge}
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {section.title}
              </h2>
              <p className="mt-2 text-base font-semibold text-[#2f4f46] sm:text-lg">{section.subtitle}</p>
              <p className="mt-4 max-w-2xl text-base text-[#56625d] sm:text-lg">{section.description}</p>

              <ul className="mt-5 space-y-2 text-sm text-[#4d5b56]">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2f4f46]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {index === 0 ? (
                <blockquote className="mt-6 rounded-xl border border-[#d1cdc0] bg-white px-4 py-3 text-sm italic text-[#4f5b57]">
                  “Not the senses I have but what I do with them is my kingdom.”
                </blockquote>
              ) : null}

              {index === 2 ? (
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {stats.map((item) => (
                    <article key={item.label} className="rounded-lg border border-[#d1cdc0] bg-white px-3 py-3">
                      <p className="text-lg font-bold text-[#1f3a33]">{item.value}</p>
                      <p className="mt-1 text-xs text-[#5d6964]">{item.label}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={index === sections.length - 1 ? "/contact" : "/programs"}
                  className="rounded-md bg-[#2f4f46] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#223c35]"
                >
                  {index === sections.length - 1 ? "상담 신청하기" : "프로그램 보기"}
                </a>
                <a
                  href="#section-1"
                  className="rounded-md border border-[#b9b29f] px-5 py-2.5 text-sm font-medium text-[#3f4e48] hover:bg-[#e7e2d4]"
                >
                  처음으로
                </a>
              </div>
              <p className="mt-6 text-xs text-[#8e958e]">섹션 {index + 1} / {sections.length}</p>
            </div>

            <div className="lg:pl-4">
              <RotatingVisual seed={index} />
              <p className="mt-3 text-xs text-[#6e7872]">
                코어그라운드 브랜드 무드(뮤트톤, 포레스트 그린, 샌드 베이지)를 반영한 비주얼 영역입니다.
              </p>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
