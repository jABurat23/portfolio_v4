"use client";

import { useEffect, useRef } from "react";
import {
  getCorridorFrameFocus,
  getZoneAtProgress,
  journeyConfig,
} from "@/config/journey";
import { getScrollProgress, subscribeScrollProgress } from "@/lib/scrollProgress";

export interface HudProps {
  visible: boolean;
}

function formatScrollPercent(progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clamped * 100);
  return `${String(pct).padStart(3, "0")}%`;
}

function formatCaptionLabel(index: number, title: string, caption: string): string {
  const num = String(index + 1).padStart(2, "0");
  return `[ ${num} ] ${title} // ${caption}`;
}

export default function Hud({ visible }: HudProps) {
  const zoneLabelRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const captionWrapRef = useRef<HTMLDivElement>(null);
  const captionTextRef = useRef<HTMLSpanElement>(null);
  const lastFrameIndexRef = useRef<number>(-1);

  useEffect(() => {
    const updateHud = (progress: number) => {
      if (zoneLabelRef.current) {
        zoneLabelRef.current.textContent = getZoneAtProgress(progress).zone.label;
      }
      if (percentRef.current) {
        percentRef.current.textContent = formatScrollPercent(progress);
      }

      const focus = getCorridorFrameFocus(progress);
      if (captionWrapRef.current) {
        captionWrapRef.current.style.opacity = focus ? focus.opacity.toFixed(3) : "0";
      }
      if (focus && captionTextRef.current && lastFrameIndexRef.current !== focus.index) {
        lastFrameIndexRef.current = focus.index;
        captionTextRef.current.textContent = formatCaptionLabel(
          focus.index,
          focus.title,
          focus.caption,
        );
      }
    };

    updateHud(getScrollProgress());
    return subscribeScrollProgress(updateHud);
  }, []);

  const initialLabel = journeyConfig.zones[0]?.label ?? "";

  return (
    <aside
      aria-label="Scroll navigation HUD"
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-30 flex h-dvh flex-col justify-between px-6 py-6 motion-safe:transition-opacity motion-safe:duration-700 motion-reduce:transition-none sm:px-10 sm:py-8 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          ref={zoneLabelRef}
          className="border border-line bg-background px-3 py-1.5 font-mono text-xs tracking-[0.2em] text-ink uppercase"
        >
          {initialLabel}
        </span>
      </div>

      <div
        ref={captionWrapRef}
        aria-hidden="true"
        className="pointer-events-none fixed bottom-16 left-1/2 -translate-x-1/2 opacity-0 md:bottom-8"
      >
        <span
          ref={captionTextRef}
          className="inline-block max-w-[calc(100vw-3rem)] truncate whitespace-nowrap border border-line bg-background px-3 py-1.5 font-mono text-xs tracking-[0.2em] text-ink uppercase"
        />
      </div>

      <div className="flex items-end justify-between">
        <div className="border border-line bg-background px-3 py-1.5 font-mono text-xs tracking-[0.2em] text-ink uppercase">
          SCROLL <span ref={percentRef}>000%</span>
        </div>
      </div>
    </aside>
  );
}
