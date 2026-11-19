"use client";

import { MouseScrollIcon } from "@phosphor-icons/react/dist/ssr/MouseScroll";
import {
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { introConfig } from "@/config/intro";
import DitherText from "./DitherText";
import { OutlinedButton } from "./OutlinedButton";

type IntroPhase =
  | "checking"
  | "skip-wait"
  | "revealing"
  | "ready"
  | "dissolving"
  | "reduced"
  | "done";

export interface IntroOverlayProps {
  sceneReady: boolean;
  hasDeepLink?: boolean;
  thresholdBiasRef: RefObject<number>;
  onStart?: () => void;
  onComplete?: () => void;
}

const ENTRY_KEYS = new Set(["Enter", " ", "ArrowDown", "PageDown"]);

function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(introConfig.sessionStorageKey, "1");
  } catch {
    // Ignore storage errors in restricted browsing contexts.
  }
}

function normalizeWheelDelta(event: WheelEvent): number {
  const scale =
    event.deltaMode === 1
      ? 16
      : event.deltaMode === 2
        ? window.innerHeight
        : 1;
  return (Math.abs(event.deltaY) + Math.abs(event.deltaX)) * scale;
}

export default function IntroOverlay({
  sceneReady,
  hasDeepLink = false,
  thresholdBiasRef,
  onStart,
  onComplete,
}: IntroOverlayProps) {
  const [phase, setPhase] = useState<IntroPhase>("checking");
  const [fontsReady, setFontsReady] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const [failsafeReady, setFailsafeReady] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [dissolveProgress, setDissolveProgress] = useState(0);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const wheelDeltaRef = useRef(0);
  const enteredRef = useRef(false);
  const touchHandledRef = useRef(false);

  const assetsReady = (fontsReady && sceneReady) || failsafeReady;

  const enterImmediate = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    markIntroPlayed();
    thresholdBiasRef.current = 0;
    setPhase("done");
  }, [thresholdBiasRef]);

  const beginDissolve = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
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

      if (!forceIntro && hasDeepLink) {
        thresholdBiasRef.current = 0;
        setPhase("skip-wait");
        return;
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
  }, [thresholdBiasRef, onStart, hasDeepLink]);

  // Skip intro straight to the target section once the scene is ready (or failsafe triggers) on deep-link loads.
  useEffect(() => {
    if (phase !== "skip-wait") return;
    if (!sceneReady && !failsafeReady) return;

    const rafId = requestAnimationFrame(() => {
      thresholdBiasRef.current = 0;
      setPhase("done");
    });

    return () => cancelAnimationFrame(rafId);
  }, [phase, sceneReady, failsafeReady, thresholdBiasRef]);

  // Failsafe: never stall entry permanently if sceneReady or fontsReady lags after reveal completes, in reduced mode, or on deep-link skip.
  useEffect(() => {
    if (assetsReady || (phase === "skip-wait" && sceneReady)) return;
    const waitingAfterReveal = phase === "revealing" && revealComplete;
    const waitingReduced = phase === "reduced";
    const waitingDeepLink = phase === "skip-wait";
    if (!waitingAfterReveal && !waitingReduced && !waitingDeepLink) return;

    const timer = window.setTimeout(() => {
      setFailsafeReady(true);
    }, introConfig.readyFailsafeMs);

    return () => window.clearTimeout(timer);
  }, [assetsReady, phase, revealComplete, sceneReady]);

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

  // Unlock user entry only after BOTH the full reveal and fonts/scene readiness (or failsafe) complete.
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

  // Listen at window level for wheel/trackpad deltas, touch tap/swipe, and Enter/Space/ArrowDown/PageDown once ready.
  useEffect(() => {
    if (phase !== "ready") return;

    wheelDeltaRef.current = 0;
    touchHandledRef.current = false;

    const onWheel = (event: WheelEvent) => {
      const delta = normalizeWheelDelta(event);
      if (delta <= 0) return;

      if (event.cancelable) {
        event.preventDefault();
      }

      wheelDeltaRef.current += delta;
      if (wheelDeltaRef.current >= introConfig.wheelThresholdPx) {
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
        touchHandledRef.current = true;
        beginDissolve();
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!touchStartRef.current || event.changedTouches.length === 0) return;
      touchStartRef.current = null;
      touchHandledRef.current = true;
      beginDissolve();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!ENTRY_KEYS.has(event.key)) return;
      event.preventDefault();
      beginDissolve();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase, beginDissolve]);

  const handlePointerEnter = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    beginDissolve();
  };

  if (phase === "done") {
    return null;
  }

  const isChecking = phase === "checking" || phase === "skip-wait";
  const isDissolving = phase === "dissolving";
  const isReduced = phase === "reduced";
  const isReady = phase === "ready";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={introConfig.title}
      onClick={isReady ? handlePointerEnter : undefined}
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
            <div className="pointer-events-none fixed inset-x-0 bottom-12 z-10 flex justify-center px-6">
              <OutlinedButton
                onClick={handlePointerEnter}
                className="pointer-events-auto gap-2.5 tracking-[0.2em]"
              >
                <MouseScrollIcon
                  size={20}
                  weight="light"
                  aria-hidden="true"
                  className="shrink-0 motion-safe:animate-scroll-bob"
                />
                <span>{introConfig.promptText}</span>
              </OutlinedButton>
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
