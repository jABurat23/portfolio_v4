"use client";

import { type MouseEvent, useCallback, useEffect, useRef } from "react";
import { aboutConfig } from "@/config/about";
import { contactConfig } from "@/config/contact";
import { getVoidPanelsState } from "@/config/journey";
import {
  getScrollProgress,
  scrollToTop,
  subscribeScrollProgress,
} from "@/lib/scrollProgress";
import { AsciiFrame } from "./AsciiFrame";
import { OutlinedButton } from "./OutlinedButton";

export interface VoidPanelsProps {
  visible: boolean;
}

function applyPanelState(
  element: HTMLElement | null,
  opacity: number,
  active: boolean,
): void {
  if (!element) return;
  element.style.opacity = opacity.toFixed(3);
  element.style.pointerEvents = active ? "auto" : "none";
  element.inert = !active;
  element.setAttribute("aria-hidden", active ? "false" : "true");
}

export default function VoidPanels({ visible }: VoidPanelsProps) {
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const backWrapRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);

  const syncPanels = useCallback((progress: number) => {
    if (!visibleRef.current) {
      applyPanelState(aboutRef.current, 0, false);
      applyPanelState(contactRef.current, 0, false);
      applyPanelState(backWrapRef.current, 0, false);
      return;
    }

    const state = getVoidPanelsState(progress);
    applyPanelState(aboutRef.current, state.aboutOpacity, state.aboutActive);
    applyPanelState(contactRef.current, state.contactOpacity, state.contactActive);
    applyPanelState(
      backWrapRef.current,
      state.backButtonOpacity,
      state.backButtonActive,
    );
  }, []);

  useEffect(() => {
    visibleRef.current = visible;
    syncPanels(getScrollProgress());
  }, [visible, syncPanels]);

  useEffect(() => {
    syncPanels(getScrollProgress());
    return subscribeScrollProgress(syncPanels);
  }, [syncPanels]);

  const handleBackToStart = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    scrollToTop();
  };

  return (
    <section
      aria-label="About and Contact"
      className="pointer-events-none fixed inset-0 z-20 flex h-dvh items-center justify-center px-5 py-20 sm:px-10"
    >
      <div className="relative flex w-full max-w-lg items-center justify-center">
        <div ref={aboutRef} aria-hidden="true" className="w-full opacity-0">
          <AsciiFrame label={aboutConfig.label}>
            <p className="font-sans text-sm leading-relaxed text-ink sm:text-base">
              {aboutConfig.body}
            </p>
          </AsciiFrame>
        </div>

        <div
          ref={contactRef}
          aria-hidden="true"
          className="absolute inset-x-0 w-full opacity-0"
        >
          <AsciiFrame label={contactConfig.label}>
            <ul className="flex flex-col divide-y divide-line">
              {contactConfig.items.map((item) => (
                <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group flex items-baseline justify-between gap-4 py-0.5 text-ink transition-colors hover:text-ink focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <span className="shrink-0 font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors group-hover:text-ink group-focus-visible:text-ink">
                      {item.label}
                    </span>
                    <span className="truncate font-mono text-xs tracking-wider text-ink underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-sm">
                      {item.text}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </AsciiFrame>

          <div
            ref={backWrapRef}
            aria-hidden="true"
            className="mt-4 flex justify-center opacity-0"
          >
            <OutlinedButton
              label={contactConfig.backToStartLabel}
              onClick={handleBackToStart}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
