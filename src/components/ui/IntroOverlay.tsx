"use client";

import { MouseScrollIcon } from "@phosphor-icons/react/dist/ssr/MouseScroll";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { introConfig } from "@/config/intro";
import { SCROLL_PROMPT_CLASS } from "@/lib/interactive";
import DitherText from "./DitherText";
import { OutlinedButton } from "./OutlinedButton";

type IntroPhase =
  | "checking"
  | "revealing"
  | "ready"
  | "dissolving"
  | "reduced"
  | "done";

export interface IntroOverlayProps {
  sceneReady: boolean;
  thresholdBiasRef: RefObject<number>;
  onStart?: () => void;
  onComplete?: () => void;
}

const IGNORED_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Tab",
]);

function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(introConfig.sessionStorageKey, "1");
  } catch {
    // Ignore storage errors in restricted browsing contexts.
  }
}

export default function IntroOverlay({
  sceneReady,
  thresholdBiasRef,
  onStart,
  onComplete,
}: IntroOverlayProps) {
  const [phase, setPhase] = useState<IntroPhase>("checking");
  const [fontsReady, setFontsReady] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [dissolveProgress, setDissolveProgress] = useState(0);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const assetsReady = fontsReady && sceneReady;

  const enterImmediate = useCallback(() => {
    markIntroPlayed();
    thresholdBiasRef.current = 0;
    setPhase("done");
  }, [thresholdBiasRef]);

  const beginDissolve = useCallback(() => {
    markIntroPlayed();
    setPhase((current) => {
      if (current === "dissolving" || current === "done") return current;
      if (current === "reduced") {
        thresholdBiasRef.current = 0;
        return "done";
      }
      return "dissolving";
    });
  }, [thresholdBiasRef]);

  // Check sessionStorage, ?intro=1 override, reduced-motion preference, and font readiness.
  useEffect(() => {
    let cancelled = false;

    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const params = new URLSearchParams(window.location.search);
      const forceIntro = params.get(introConfig.forceQueryParam) === "1";

      let alreadyPlayed = false;
      try {
        alreadyPlayed =
          window.sessionStorage.getItem(introConfig.sessionStorageKey) === "1";
      } catch {
        alreadyPlayed = false;
      }

      if (!forceIntro && alreadyPlayed) {
        thresholdBiasRef.current = 0;
        setPhase("done");
        return;
      }

      if (reduced) {
        thresholdBiasRef.current = 0;
        onStart?.();
        setPhase("reduced");
        return;
      }

      thresholdBiasRef.current = -1;
      onStart?.();
      setPhase("revealing");
    });

    document.fonts.ready
      .then(() => {
        if (!cancelled) setFontsReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontsReady(true);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [thresholdBiasRef, onStart]);

  // Lock page scrolling while the intro overlay is active and notify completion once done.
  useEffect(() => {
    if (phase === "checking") return;

    if (phase === "done") {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      onComplete?.();
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [phase, onComplete]);

  // Gradual Bayer reveal configured by introConfig.revealDurationMs; always plays in full regardless of asset load speed.
  useEffect(() => {
    if (phase !== "revealing") return;

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / introConfig.revealDurationMs);
      setRevealProgress(progress);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setRevealComplete(true);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [phase]);

  // Unlock user entry only after BOTH the full reveal and fonts/scene readiness complete.
  useEffect(() => {
    if (!assetsReady) return;

    const rafId = requestAnimationFrame(() => {
      if (phase === "revealing" && revealComplete) {
        setPhase("ready");
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [assetsReady, phase, revealComplete]);

  // 1.5-second Bayer dissolve out of intro and into the 3D world.
  useEffect(() => {
    if (phase !== "dissolving") return;

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / introConfig.dissolveDurationMs);
      setDissolveProgress(progress);
      thresholdBiasRef.current = -(1 - progress);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        thresholdBiasRef.current = 0;
        setPhase("done");
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [phase, thresholdBiasRef]);

  // Listen for wheel, touch swipe, click, or keyboard input once ready to enter.
  useEffect(() => {
    if (phase !== "ready") return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > 0 || Math.abs(event.deltaX) > 0) {
        beginDissolve();
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchMove = (event: TouchEvent) => {
      const start = touchStartRef.current;
      const touch = event.touches[0];
      if (!start || !touch) return;

      const distance = Math.hypot(
        touch.clientX - start.x,
        touch.clientY - start.y,
      );
      if (distance > 14) {
        beginDissolve();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (IGNORED_KEYS.has(event.key)) return;
      if (event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
      }
      beginDissolve();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase, beginDissolve]);

  if (phase === "done") {
    return null;
  }

  const isChecking = phase === "checking";
  const isDissolving = phase === "dissolving";
  const isReduced = phase === "reduced";
  const isReady = phase === "ready";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={introConfig.title}
      onClick={isReady ? beginDissolve : undefined}
      className={`fixed inset-0 z-50 touch-none select-none ${
        isDissolving ? "pointer-events-none bg-transparent" : "bg-background"
      } ${isReady ? "cursor-pointer" : ""}`}
    >
      <p className="sr-only">{introConfig.srDescription}</p>

      {!isChecking && (
        <div className="relative h-full w-full">
          <DitherText
            text={introConfig.title}
            mode={isReduced ? "static" : isDissolving ? "dissolve" : "reveal"}
            progress={isReduced ? 1 : isDissolving ? dissolveProgress : revealProgress}
            fontsReady={fontsReady}
          />

          {isReady && (
            <div className="pointer-events-none fixed inset-x-0 bottom-12 z-10 flex flex-col items-center gap-2 px-6">
              <MouseScrollIcon
                size={22}
                weight="light"
                aria-hidden="true"
                className="text-ink motion-safe:animate-scroll-bob"
              />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  beginDissolve();
                }}
                className={SCROLL_PROMPT_CLASS}
              >
                {introConfig.promptText}
              </button>
            </div>
          )}

          {isReduced && (
            <div className="fixed inset-x-0 bottom-14 z-10 flex justify-center px-6">
              <OutlinedButton
                label={introConfig.reducedMotionButtonLabel}
                disabled={!assetsReady}
                onClick={(event) => {
                  event.stopPropagation();
                  enterImmediate();
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
