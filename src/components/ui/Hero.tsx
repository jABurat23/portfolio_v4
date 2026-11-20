"use client";

import { TriangleIcon } from "@phosphor-icons/react/dist/ssr/Triangle";
import { useEffect, useRef } from "react";
import { journeyConfig } from "@/config/journey";
import { siteConfig } from "@/config/site";
import { getScrollProgress, subscribeScrollProgress } from "@/lib/scrollProgress";

export interface HeroProps {
  visible: boolean;
}

export default function Hero({ visible }: HeroProps) {
  const headerRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyProgress = (progress: number) => {
      const fadeEnd = Math.max(0.01, journeyConfig.heroFadeEndProgress);
      const ratio = Math.max(0, Math.min(1, progress / fadeEnd));
      const opacity = 1 - ratio;
      const offsetPx = mediaQuery.matches ? 0 : ratio * journeyConfig.heroDriftPx;

      if (headerRef.current) {
        headerRef.current.style.opacity = String(opacity);
        headerRef.current.style.transform = `translate3d(0, -${offsetPx}px, 0)`;
      }

      if (hintRef.current) {
        hintRef.current.style.opacity =
          progress >= journeyConfig.scrollHintHideProgress ? "0" : "1";
      }
    };

    applyProgress(getScrollProgress());
    const unsubscribe = subscribeScrollProgress(applyProgress);
    const handleMotionChange = () => applyProgress(getScrollProgress());
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <section
      aria-label={siteConfig.name}
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-20 flex h-dvh flex-col justify-between px-6 py-8 motion-safe:transition-opacity motion-safe:duration-700 motion-reduce:transition-none sm:px-12 sm:py-12 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <header
        ref={headerRef}
        className="flex max-w-4xl flex-col items-start gap-3 pt-10 will-change-transform sm:pt-12"
      >
        <h1 className="font-mono text-4xl font-bold tracking-[0.24em] text-ink uppercase sm:text-6xl md:text-7xl">
          {siteConfig.name}
        </h1>
        <div className="min-h-6">
          {siteConfig.tagline ? (
            <p className="font-sans text-sm leading-relaxed tracking-wide text-muted sm:text-base">
              {siteConfig.tagline}
            </p>
          ) : null}
        </div>
      </header>

      <div ref={hintRef} className="flex justify-center pb-12 sm:pb-12">
        <span className="bg-background p-2">
          <TriangleIcon
            size={12}
            weight="fill"
            aria-hidden="true"
            className="block rotate-180 text-ink motion-safe:animate-triangle-blink"
          />
        </span>
      </div>
    </section>
  );
}
