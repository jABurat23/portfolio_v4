"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { type RefObject, useEffect, useRef, useState } from "react";
import { journeyConfig } from "@/config/journey";
import { registerScrollToProgress, setScrollProgress } from "@/lib/scrollProgress";

export interface ScrollManagerProps {
  spacerRef: RefObject<HTMLDivElement | null>;
  introDone: boolean;
  introDidPlay: boolean;
  initialTargetProgress?: number | null;
  deferInitialScroll?: boolean;
}

function readWindowScrollProgress(spacer: HTMLElement): number {
  const maxScroll = Math.max(1, spacer.offsetHeight - window.innerHeight);
  return Math.max(0, Math.min(1, window.scrollY / maxScroll));
}

export default function ScrollManager({
  spacerRef,
  introDone,
  introDidPlay,
  initialTargetProgress = null,
  deferInitialScroll = false,
}: ScrollManagerProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const introDoneRef = useRef(introDone);
  const appliedInitialTargetRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    introDoneRef.current = introDone;
  }, [introDone]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => setReducedMotion(mediaQuery.matches);
    const rafId = requestAnimationFrame(syncReducedMotion);

    mediaQuery.addEventListener("change", syncReducedMotion);
    return () => {
      cancelAnimationFrame(rafId);
      mediaQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  useEffect(() => {
    const spacer = spacerRef.current;
    if (!spacer) return;

    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    if (!reducedMotion) {
      const { lerp, wheelMultiplier, syncTouch } = journeyConfig.smoothScroll;
      lenis = new Lenis({
        smoothWheel: true,
        syncTouch,
        lerp,
        wheelMultiplier,
      });
      lenisRef.current = lenis;

      if (!introDoneRef.current) {
        lenis.stop();
      }

      lenis.on("scroll", ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: spacer,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, spacerRef);

    ScrollTrigger.refresh();
    if (
      !introDoneRef.current &&
      initialTargetProgress !== null &&
      !deferInitialScroll
    ) {
      setScrollProgress(initialTargetProgress, { snap: true });
    } else {
      const initial = triggerRef.current
        ? triggerRef.current.progress
        : readWindowScrollProgress(spacer);
      setScrollProgress(initial);
    }

    const unregisterScrollToProgress = registerScrollToProgress((progress) => {
      const maxScroll = Math.max(0, spacer.offsetHeight - window.innerHeight);
      const targetTop = progress * maxScroll;
      if (lenis && !reducedMotion) {
        lenis.scrollTo(targetTop);
      } else {
        window.scrollTo({ top: targetTop, behavior: "auto" });
      }
    });

    return () => {
      unregisterScrollToProgress();
      ctx.revert();
      triggerRef.current = null;
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenis) {
        lenis.destroy();
        if (lenisRef.current === lenis) {
          lenisRef.current = null;
        }
      }
    };
  }, [spacerRef, reducedMotion, initialTargetProgress, deferInitialScroll]);

  useEffect(() => {
    const lenis = lenisRef.current;
    const spacer = spacerRef.current;

    if (!introDone) {
      lenis?.stop();
      return;
    }

    if (initialTargetProgress !== null && !appliedInitialTargetRef.current) {
      appliedInitialTargetRef.current = true;
      const targetTop = spacer
        ? Math.round(
            initialTargetProgress *
              Math.max(0, spacer.offsetHeight - window.innerHeight),
          )
        : 0;
      lenis?.start();
      window.scrollTo(0, targetTop);
      lenis?.scrollTo(targetTop, { immediate: true, force: true });
      setScrollProgress(initialTargetProgress, { snap: true });
      ScrollTrigger.refresh();
      ScrollTrigger.update();
      return;
    }

    if (introDidPlay) {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
      setScrollProgress(0);
    }

    ScrollTrigger.refresh();
    if (!introDidPlay && spacer) {
      const synced = triggerRef.current
        ? triggerRef.current.progress
        : readWindowScrollProgress(spacer);
      setScrollProgress(synced);
    }

    lenis?.start();
  }, [introDone, introDidPlay, initialTargetProgress, spacerRef, reducedMotion]);

  return null;
}
