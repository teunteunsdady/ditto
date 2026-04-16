"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type RotatingVisualProps = {
  seed?: number;
  fullBleed?: boolean;
};

const motionScenes = [
  {
    title: "CoreGround",
    subtitle: "Find your center in motion",
    accent: "from-[#9be2c6] via-[#58b48f] to-[#2f7a63]",
  },
  {
    title: "Inner Balance",
    subtitle: "Design emotional clarity",
    accent: "from-[#f6e2c4] via-[#e7c99a] to-[#c79d67]",
  },
  {
    title: "Action Growth",
    subtitle: "Turn insight into action",
    accent: "from-[#a8bcff] via-[#8198e8] to-[#5b6fc1]",
  },
] as const;

const orbitDots = [
  { top: "16%", left: "22%", size: 20, color: "#8fd9ba", delay: "0.2s" },
  { top: "22%", left: "70%", size: 14, color: "#f0d2a4", delay: "0.8s" },
  { top: "40%", left: "14%", size: 12, color: "#8aa4f2", delay: "1.4s" },
  { top: "58%", left: "76%", size: 18, color: "#6cbda0", delay: "0.5s" },
  { top: "72%", left: "28%", size: 14, color: "#dcb786", delay: "1.1s" },
  { top: "82%", left: "62%", size: 10, color: "#8aa4f2", delay: "1.7s" },
] as const;

export function RotatingVisual({ seed = 0, fullBleed = false }: RotatingVisualProps) {
  const [activeIndex, setActiveIndex] = useState(seed % motionScenes.length);
  const touchStartXRef = useRef<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const orderedScenes = useMemo(() => {
    const offset = seed % motionScenes.length;
    return [
      ...motionScenes.slice(offset),
      ...motionScenes.slice(0, offset),
    ];
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
        : (prev - 1 + orderedScenes.length) % orderedScenes.length,
    );
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x, y });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      data-allow-touch-pan="true"
      className={`relative overflow-hidden border border-[#d7ccb8] bg-[#f7f2e8] shadow-[0_16px_36px_rgba(63,78,72,0.15)] ${
        fullBleed ? "h-full rounded-none sm:rounded-2xl" : "rounded-2xl"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={`relative w-full ${fullBleed ? "h-full min-h-[420px]" : "aspect-[4/3]"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(88,180,143,0.22),transparent_45%),radial-gradient(circle_at_85%_78%,rgba(129,152,232,0.2),transparent_40%),linear-gradient(130deg,#f9f5eb_0%,#efe6d7_40%,#f7f3ea_100%)]" />

        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(900px) rotateX(${tilt.y * -4}deg) rotateY(${tilt.x * 5}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute left-1/2 top-[19%] h-[56%] w-1.5 -translate-x-1/2 rounded-full bg-[#ded4c3]" />
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/40 backdrop-blur-md" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white/70" />

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
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
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
              <p className="max-w-[190px] text-[10px] font-medium text-[#63736d] sm:max-w-[220px] sm:text-xs">
                welcome to CoreGround / 당신의 관점을 바꾸는 새로운 시작
              </p>
              <span className="text-[10px] font-semibold text-[#4e6059] sm:text-xs">more...</span>
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
