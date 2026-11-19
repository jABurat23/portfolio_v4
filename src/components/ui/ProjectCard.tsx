"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCorridorFrameFocus } from "@/config/journey";
import { worksConfig } from "@/config/works";
import { OUTLINED_BUTTON_CLASS } from "@/lib/interactive";
import { getScrollProgress, subscribeScrollProgress } from "@/lib/scrollProgress";

export interface ProjectCardProps {
  visible: boolean;
}

export function resolveLocalWorkImage(image?: string | null): string | null {
  if (!image) return null;
  const trimmed = image.trim();
  return trimmed.startsWith("/works/") ? trimmed : null;
}

function applyCardState(
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

export default function ProjectCard({ visible }: ProjectCardProps) {
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  const activeIndexRef = useRef<number>(-1);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const syncCard = useCallback((progress: number) => {
    if (!visibleRef.current) {
      applyCardState(cardWrapRef.current, 0, false);
      return;
    }

    const focus = getCorridorFrameFocus(progress);
    if (!focus) {
      applyCardState(cardWrapRef.current, 0, false);
      return;
    }

    if (focus.index !== activeIndexRef.current) {
      activeIndexRef.current = focus.index;
      setActiveIndex(focus.index);
    }

    applyCardState(cardWrapRef.current, focus.opacity, focus.active);
  }, []);

  useEffect(() => {
    visibleRef.current = visible;
    syncCard(getScrollProgress());
  }, [visible, syncCard]);

  useEffect(() => {
    syncCard(getScrollProgress());
    return subscribeScrollProgress(syncCard);
  }, [syncCard]);

  const item =
    activeIndex >= 0 && activeIndex < worksConfig.items.length
      ? worksConfig.items[activeIndex]
      : null;

  const displayIndex = activeIndex >= 0 ? activeIndex : 0;
  const numLabel = `[ ${String(displayIndex + 1).padStart(2, "0")} ]`;
  const frameOnLeft = displayIndex % 2 === 0;
  const desktopSideClass = frameOnLeft
    ? "md:right-10 md:left-auto"
    : "md:left-10 md:right-auto";

  const localImage = resolveLocalWorkImage(item?.image);
  const hasDescription = Boolean(item?.description && item.description.trim().length > 0);
  const hasUrl = Boolean(item?.url && item.url.trim().length > 0);

  return (
    <section
      aria-label="Selected Project"
      className="pointer-events-none fixed inset-0 z-20"
    >
      <div
        ref={cardWrapRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-6 bottom-16 opacity-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:w-80 md:-translate-y-1/2 lg:w-[22rem] ${desktopSideClass}`}
      >
        {item ? (
          <article className="border border-line bg-background p-3 md:p-4">
            <header className="mb-2.5 flex items-baseline justify-between gap-3 border-b border-line pb-2 font-mono text-xs tracking-[0.18em] text-ink uppercase md:mb-3">
              <span className="shrink-0 text-muted">{numLabel}</span>
              <h2 className="truncate font-bold text-ink">{item.title}</h2>
            </header>

            <div className="flex items-stretch gap-3 md:flex-col md:gap-3">
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden border border-line bg-background md:w-full">
                {localImage ? (
                  <Image
                    src={localImage}
                    alt={item.title}
                    fill
                    loading="eager"
                    sizes="(min-width: 768px) 320px, 112px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 text-center">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase md:text-xs">
                      COMING SOON
                    </span>
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 md:gap-3">
                {hasDescription ? (
                  <p className="line-clamp-3 font-sans text-xs leading-relaxed text-ink md:line-clamp-none md:text-sm">
                    {item.description}
                  </p>
                ) : (
                  <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
                    {item.caption}
                  </p>
                )}

                {hasUrl && item.url ? (
                  <div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={OUTLINED_BUTTON_CLASS}
                    >
                      VIEW PROJECT
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
