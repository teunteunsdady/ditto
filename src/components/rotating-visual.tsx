"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type RotatingVisualProps = {
  seed?: number;
};

const sampleImages = ["/demo-1.svg", "/demo-2.svg", "/demo-3.svg"];

export function RotatingVisual({ seed = 0 }: RotatingVisualProps) {
  const [activeIndex, setActiveIndex] = useState(seed % sampleImages.length);
  const orderedImages = useMemo(() => {
    const offset = seed % sampleImages.length;
    return [
      ...sampleImages.slice(offset),
      ...sampleImages.slice(0, offset),
    ];
  }, [seed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % orderedImages.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [orderedImages.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
      <div className="relative aspect-[4/3] w-full">
        {orderedImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`샘플 비주얼 ${index + 1}`}
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-700 ${
              activeIndex === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1">
        {orderedImages.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full ${
              activeIndex === index ? "bg-white" : "bg-white/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
