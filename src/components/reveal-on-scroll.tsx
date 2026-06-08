"use client";

import { useEffect } from "react";

export function RevealOnScroll() {
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

  return null;
}
