"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type RotatingVisualProps = {
  seed?: number;
  fullBleed?: boolean;
};

const motionScenes = [
  {
    title: "CoreGround",
    subtitle: "Solid foundation, focused execution",
    accent: "from-[#9be2c6] via-[#58b48f] to-[#2f7a63]",
  },
  {
    title: "Core Engine",
    subtitle: "Precision and emotional clarity",
    accent: "from-[#f6e2c4] via-[#e7c99a] to-[#c79d67]",
  },
  {
    title: "Ground Layer",
    subtitle: "Structure that enables growth",
    accent: "from-[#a8bcff] via-[#8198e8] to-[#5b6fc1]",
  },
] as const;

const orbitDots = [
  { top: "14%", left: "20%", size: 18, color: "#8fd9ba", delay: "0.2s" },
  { top: "20%", left: "74%", size: 14, color: "#f0d2a4", delay: "0.8s" },
  { top: "38%", left: "12%", size: 10, color: "#8aa4f2", delay: "1.4s" },
  { top: "56%", left: "78%", size: 16, color: "#6cbda0", delay: "0.5s" },
  { top: "72%", left: "24%", size: 12, color: "#dcb786", delay: "1.1s" },
  { top: "82%", left: "64%", size: 10, color: "#8aa4f2", delay: "1.7s" },
] as const;

export function RotatingVisual({ seed = 0, fullBleed = false }: RotatingVisualProps) {
  const [activeIndex, setActiveIndex] = useState(seed % motionScenes.length);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const touchStartXRef = useRef<number | null>(null);

  const orderedScenes = useMemo(() => {
    const offset = seed % motionScenes.length;
    return [...motionScenes.slice(offset), ...motionScenes.slice(0, offset)];
  }, [seed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % orderedScenes.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [orderedScenes.length]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX == null || endX == null) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 30) {
      return;
    }

    setActiveIndex((prev) =>
      deltaX < 0
        ? (prev + 1) % orderedScenes.length
        : (prev - 1 + orderedScenes.length) % orderedScenes.length
    );
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x, y });
  };

  return (
    <div
      data-allow-touch-pan="true"
      className={`relative overflow-hidden border border-[#d0c2ac] bg-[#f5eddd] shadow-[0_18px_48px_rgba(47,79,70,0.13)] ${
        fullBleed ? "h-full rounded-2xl" : "rounded-2xl"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className={`relative w-full ${fullBleed ? "h-full min-h-[430px]" : "aspect-[4/3]"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(88,180,143,0.24),transparent_40%),radial-gradient(circle_at_82%_74%,rgba(129,152,232,0.2),transparent_36%),linear-gradient(132deg,#f9f3e7_0%,#efe5d4_46%,#f8f2e6_100%)]" />

        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(47,79,70,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(47,79,70,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(900px) rotateX(${tilt.y * -4}deg) rotateY(${tilt.x * 5}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/40 backdrop-blur-md" />
          <div className="absolute left-1/2 top-1/2 h-34 w-34 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 bg-white/75" />

          <div className="absolute left-5 top-5 rounded-xl border border-white/70 bg-white/55 px-3 py-2 text-[11px] text-[#4a5f59] backdrop-blur-sm sm:text-xs">
            <p className="font-semibold">CORE</p>
            <p>본질 중심 설계</p>
          </div>
          <div className="absolute bottom-5 right-5 rounded-xl border border-white/70 bg-white/55 px-3 py-2 text-[11px] text-[#4a5f59] backdrop-blur-sm sm:text-xs">
            <p className="font-semibold">GROUND</p>
            <p>단단한 실행 기반</p>
          </div>

          {orbitDots.map((piece, index) => (
            <span
              key={`${piece.top}-${piece.left}`}
              className="absolute block rounded-full"
              style={{
                top: piece.top,
                left: piece.left,
                width: piece.size,
                height: piece.size,
                transform: `translateZ(${(index % 3) * 10}px)`,
                backgroundColor: piece.color,
                boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
                animation: `cgFloat ${6 + (index % 3)}s ease-in-out infinite`,
                animationDelay: piece.delay,
              }}
            />
          ))}
        </div>

        {orderedScenes.map((scene, index) => (
          <div
            key={scene.title}
            className={`absolute inset-0 transition-all duration-700 ${
              activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between sm:left-6 sm:right-6">
              <p className="max-w-[200px] text-[10px] font-medium uppercase tracking-wide text-[#64746f] sm:max-w-[240px] sm:text-xs">
                CoreGround / Foundation for focused growth
              </p>
              <span className="text-[10px] font-semibold text-[#445952] sm:text-xs">v2.0</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20 sm:bottom-6 sm:left-6 sm:right-6">
              <p
                className={`bg-gradient-to-r ${scene.accent} bg-clip-text font-extrabold tracking-tight text-transparent ${
                  fullBleed ? "text-4xl sm:text-6xl lg:text-7xl" : "text-3xl sm:text-5xl"
                }`}
                style={{ animation: "cgPulse 2.8s ease-in-out infinite" }}
              >
                {scene.title}
              </p>
              <p className={`mt-1 text-[#55665f] ${fullBleed ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                {scene.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-2.5 py-1 backdrop-blur">
        {orderedScenes.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index ? "w-4 bg-[#2f7a63]" : "w-1.5 bg-[#9baaa4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
