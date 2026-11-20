"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getCorridorStopFocus } from "@/config/journey";
import { worksConfig } from "@/config/works";
import { OUTLINED_BUTTON_CLASS } from "@/lib/interactive";
import { getScrollProgress, subscribeScrollProgress } from "@/lib/scrollProgress";

export interface ProjectCardProps {
  visible: boolean;
  onActiveWorkChange?: (activeIndex: number | null) => void;
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
  element.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
  element.style.pointerEvents = active ? "auto" : "none";
  element.inert = !active;
}

export default function ProjectCard({
  visible,
  onActiveWorkChange,
}: ProjectCardProps) {
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  const activeIndexRef = useRef<number>(-1);
  const exposedIndexRef = useRef<number | null>(null);
  const onActiveWorkChangeRef = useRef(onActiveWorkChange);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    onActiveWorkChangeRef.current = onActiveWorkChange;
  }, [onActiveWorkChange]);

  const emitExposedIndex = useCallback((nextIndex: number | null) => {
    if (exposedIndexRef.current !== nextIndex) {
      exposedIndexRef.current = nextIndex;
      onActiveWorkChangeRef.current?.(nextIndex);
    }
  }, []);

  const syncCard = useCallback(
    (progress: number) => {
      if (!visibleRef.current) {
        applyCardState(cardWrapRef.current, 0, false);
        emitExposedIndex(null);
        return;
      }

      const focus = getCorridorStopFocus(progress);
      if (!focus) {
        applyCardState(cardWrapRef.current, 0, false);
        emitExposedIndex(null);
        return;
      }

      if (focus.index !== activeIndexRef.current) {
        activeIndexRef.current = focus.index;
        setActiveIndex(focus.index);
      }

      applyCardState(cardWrapRef.current, focus.opacity, focus.active);
      emitExposedIndex(focus.active ? focus.index : null);
    },
    [emitExposedIndex],
  );

  useLayoutEffect(() => {
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
  const stopOnLeft = displayIndex % 2 === 0;
  const desktopSideClass = stopOnLeft
    ? "md:right-10 md:left-auto"
    : "md:left-10 md:right-auto";

  const localImage = resolveLocalWorkImage(item?.image);
  const hasDescription = Boolean(item?.description && item.description.trim().length > 0);
  const hasUrl = Boolean(item?.url && item.url.trim().length > 0);
  const trimmedCaption = item?.caption?.trim() ?? "";
  const showCaptionLine =
    !hasDescription &&
    trimmedCaption.length > 0 &&
    (Boolean(localImage) || trimmedCaption.toUpperCase() !== "COMING SOON");
  const hasBodyColumn = hasDescription || showCaptionLine || hasUrl;

  return (
    <section
      aria-label="Selected Project"
      className="pointer-events-none fixed inset-0 z-20"
    >
      <div
        ref={cardWrapRef}
        className={`invisible pointer-events-none fixed inset-x-6 bottom-20 opacity-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:w-80 md:-translate-y-1/2 lg:w-[22rem] ${desktopSideClass}`}
      >
        {item ? (
          <article className="border border-line-strong bg-background p-3 md:p-4">
            <header className="mb-2.5 flex items-baseline justify-between gap-3 border-b border-line pb-2 font-mono text-[13px] tracking-[0.16em] text-ink uppercase md:mb-3">
              <span className="shrink-0 text-muted">{numLabel}</span>
              <h2 className="truncate font-bold text-ink">{item.title}</h2>
            </header>

            <div className="flex items-stretch gap-3 md:flex-col md:gap-3">
              <div
                className={`relative aspect-video shrink-0 overflow-hidden border border-line bg-background md:w-full ${
                  hasBodyColumn ? "w-28" : "w-full"
                }`}
              >
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
                    <span className="font-mono text-[13px] tracking-[0.14em] text-muted uppercase">
                      COMING SOON
                    </span>
                  </div>
                )}
              </div>

              {hasBodyColumn ? (
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 md:gap-3">
                  {hasDescription ? (
                    <p className="line-clamp-3 font-sans text-[13px] leading-relaxed text-ink md:line-clamp-none md:text-sm">
                      {item.description}
                    </p>
                  ) : showCaptionLine ? (
                    <p className="font-mono text-[13px] tracking-[0.16em] text-muted uppercase">
                      {trimmedCaption}
                    </p>
                  ) : null}

                  {hasUrl && item.url ? (
                    <div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${OUTLINED_BUTTON_CLASS} gap-1.5`}
                      >
                        <span>VIEW PROJECT</span>
                        <ArrowUpRightIcon
                          size={14}
                          weight="regular"
                          aria-hidden="true"
                          className="shrink-0"
                        />
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
