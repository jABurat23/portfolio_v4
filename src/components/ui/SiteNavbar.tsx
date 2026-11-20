"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { getActiveNavHref, navConfig } from "@/config/nav";
import {
  getScrollProgress,
  scrollToProgress,
  subscribeScrollProgress,
} from "@/lib/scrollProgress";
import PillNav, { type PillNavItem, type PillNavSize } from "./PillNav/PillNav";

export default function SiteNavbar() {
  const initialHref = getActiveNavHref(getScrollProgress());
  const activeHrefRef = useRef(initialHref);
  const [activeHref, setActiveHref] = useState(initialHref);
  const [size, setSize] = useState<PillNavSize>("md");

  useEffect(() => {
    const query = window.matchMedia(
      `(max-width: ${navConfig.narrowBreakpointPx - 1}px)`,
    );
    const syncSize = () => setSize(query.matches ? "sm" : "md");
    const rafId = requestAnimationFrame(syncSize);

    query.addEventListener("change", syncSize);
    return () => {
      cancelAnimationFrame(rafId);
      query.removeEventListener("change", syncSize);
    };
  }, []);

  useEffect(() => {
    const syncActive = (progress: number) => {
      const next = getActiveNavHref(progress);
      if (next !== activeHrefRef.current) {
        activeHrefRef.current = next;
        setActiveHref(next);
      }
    };

    syncActive(getScrollProgress());
    return subscribeScrollProgress(syncActive);
  }, []);

  const updateUrlHash = (hash: string) => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${hash}`,
      );
    }
  };

  const handleItemClick = (
    item: PillNavItem,
    index: number,
    event: MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    const entry = navConfig.items[index] ?? navConfig.items.find((n) => n.href === item.href);
    if (!entry) return;
    updateUrlHash(entry.href);
    scrollToProgress(entry.targetProgress);
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-2"
      style={{
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${navConfig.bottomSpacingPx}px)`,
      }}
    >
      <div className="pointer-events-auto max-w-full">
        <PillNav
          items={navConfig.items}
          activeHref={activeHref}
          onItemClick={handleItemClick}
          theme="dark"
          layout="split"
          size={size}
          itemStyle="plain"
          hoverEffect="fill"
          indicator="dot"
          surface="solid"
          highlightColor="#F2F2F2"
          highlightTextColor="#0A0A0A"
          textColor="#F2F2F2"
          barColor="#0A0A0A"
          collapse="never"
          ariaLabel={navConfig.ariaLabel}
        />
      </div>
    </div>
  );
}
