"use client";

import { useEffect, useRef, useState } from "react";

import { RotatingVisual } from "@/components/rotating-visual";

const sections = [
  {
    id: "section-1",
    label: "01",
    title: "브랜드 메시지를 선명하게 전달하는 첫 화면",
    description:
      "방문자가 5초 안에 서비스 목적과 가치를 이해할 수 있도록 핵심 카피와 CTA를 배치합니다.",
  },
  {
    id: "section-2",
    label: "02",
    title: "문제와 해결 방식을 직관적으로 설명하는 구간",
    description:
      "고객의 고민과 우리 서비스가 제공하는 해결책을 짝지어 보여주면 전환율이 올라갑니다.",
  },
  {
    id: "section-3",
    label: "03",
    title: "핵심 프로그램/서비스 안내 섹션",
    description:
      "대표 상품을 3~4개 카드로 정리해 사용자에게 선택지를 명확히 제공합니다.",
  },
  {
    id: "section-4",
    label: "04",
    title: "신뢰를 강화하는 성과/후기 섹션",
    description:
      "실제 데이터, 사례, 고객 인용을 통해 브랜드 신뢰도를 끌어올리는 구간입니다.",
  },
  {
    id: "section-5",
    label: "05",
    title: "인사이트/콘텐츠 섹션",
    description:
      "콘텐츠 허브 역할의 섹션으로, 브랜드 전문성을 축적하고 재방문 동기를 만듭니다.",
  },
  {
    id: "section-6",
    label: "06",
    title: "FAQ 또는 도입 프로세스 안내",
    description:
      "도입 전 궁금증을 선제적으로 해소해 문의 단계로 자연스럽게 이동하도록 돕습니다.",
  },
  {
    id: "section-7",
    label: "07",
    title: "문의 전환 섹션",
    description:
      "마지막 구간에서 상담 신청 버튼과 연락 채널을 명확히 제시해 행동을 유도합니다.",
  },
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
      className="h-[calc(100vh-4rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth"
    >
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          data-section-index={index}
          className="flex h-[calc(100vh-4rem)] snap-start items-center px-2 py-6 transition-all duration-500 sm:px-4 lg:px-6"
        >
          <div
            className={`mx-auto grid w-full max-w-[1280px] gap-6 rounded-2xl border p-5 shadow-sm transition-all duration-500 sm:rounded-3xl sm:p-8 lg:grid-cols-2 lg:gap-8 lg:p-12 ${
              activeSection === index
                ? "scale-100 border-blue-200 bg-white opacity-100"
                : "scale-[0.985] border-gray-200 bg-gray-50 opacity-65"
            }`}
          >
            <div>
              <p
                className={`text-sm font-semibold transition-colors duration-500 ${
                  activeSection === index ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {section.label}
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {section.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">{section.description}</p>
              <div className="mt-8 flex gap-3">
                <a
                  href="#section-7"
                  className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white"
                >
                  상담 문의
                </a>
                <a
                  href="#section-1"
                  className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700"
                >
                  처음으로
                </a>
              </div>
              <p className="mt-6 text-xs text-gray-400">섹션 {index + 1} / {sections.length}</p>
            </div>

            <div className="lg:pl-4">
              <RotatingVisual seed={index} />
              <p className="mt-3 text-xs text-gray-500">
                샘플 이미지가 자동 전환되는 모션 데모입니다.
              </p>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
