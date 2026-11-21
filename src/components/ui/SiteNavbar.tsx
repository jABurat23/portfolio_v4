"use client";

import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  getActiveNavHref,
  type NavDockPinState,
  navConfig,
  parseNavQueryOverride,
} from "@/config/nav";
import {
  getScrollProgress,
  scrollToProgress,
  subscribeScrollProgress,
} from "@/lib/scrollProgress";
import PillNav, { type PillNavItem, type PillNavSize } from "./PillNav/PillNav";

type NavDockState = "awake" | "idle";

export default function SiteNavbar() {
  const initialHref = getActiveNavHref(getScrollProgress());
  const activeHrefRef = useRef(initialHref);
  const dockRef = useRef<HTMLDivElement>(null);
  const [pinnedState] = useState<NavDockPinState>(() => parseNavQueryOverride());
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

  useLayoutEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    if (pinnedState !== null) {
      dock.dataset.navState = pinnedState;
    } else if (!dock.dataset.navState) {
      dock.dataset.navState = "awake";
    }
  }, [pinnedState]);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    if (pinnedState !== null) {
      dock.dataset.navState = pinnedState;
      return;
    }

    let introHold = true;
    let pointerInside = false;
    let hoverHold = false;
    let focusInside = false;
    let focusHold = false;
    let touchHold = false;
    let lastPointerDownAt = -Infinity;
    let lastTouchAt = -Infinity;

    let introTimer = 0;
    let leaveTimer = 0;
    let focusTimer = 0;
    let touchTimer = 0;

    const setDockState = (next: NavDockState) => {
      if (dock.dataset.navState !== next) {
        dock.dataset.navState = next;
      }
    };

    const reconcile = () => {
      const awake =
        introHold ||
        pointerInside ||
        hoverHold ||
        focusInside ||
        focusHold ||
        touchHold;
      setDockState(awake ? "awake" : "idle");
    };

    const scheduleTouchRest = () => {
      window.clearTimeout(touchTimer);
      touchHold = true;
      reconcile();
      touchTimer = window.setTimeout(() => {
        touchHold = false;
        reconcile();
      }, navConfig.idle.touchRestDelayMs);
    };

    const onPointerDown = (event: PointerEvent) => {
      lastPointerDownAt = performance.now();
      if (event.pointerType === "touch") {
        lastTouchAt = lastPointerDownAt;
        scheduleTouchRest();
        return;
      }
      window.clearTimeout(leaveTimer);
      hoverHold = false;
      pointerInside = true;
      reconcile();
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (
        event.pointerType === "touch" ||
        performance.now() - lastTouchAt < 650
      ) {
        return;
      }
      window.clearTimeout(leaveTimer);
      hoverHold = false;
      pointerInside = true;
      reconcile();
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (
        event.pointerType === "touch" ||
        performance.now() - lastTouchAt < 650
      ) {
        return;
      }
      pointerInside = false;
      hoverHold = true;
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => {
        hoverHold = false;
        reconcile();
      }, navConfig.idle.hoverLeaveDelayMs);
      reconcile();
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      const isVisibleFocus =
        target instanceof Element && target.matches(":focus-visible");
      const fromRecentPointer = performance.now() - lastPointerDownAt < 300;
      if (!isVisibleFocus && fromRecentPointer) {
        return;
      }
      window.clearTimeout(focusTimer);
      focusHold = false;
      focusInside = true;
      reconcile();
    };

    const onFocusOut = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && dock.contains(nextTarget)) {
        return;
      }
      if (!focusInside) return;
      focusInside = false;
      focusHold = true;
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        focusHold = false;
        reconcile();
      }, navConfig.idle.focusLeaveDelayMs);
      reconcile();
    };

    reconcile();
    introTimer = window.setTimeout(() => {
      introHold = false;
      reconcile();
    }, navConfig.idle.introHintMs);

    dock.addEventListener("pointerdown", onPointerDown, true);
    dock.addEventListener("pointerenter", onPointerEnter);
    dock.addEventListener("pointerleave", onPointerLeave);
    dock.addEventListener("focusin", onFocusIn);
    dock.addEventListener("focusout", onFocusOut);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(focusTimer);
      window.clearTimeout(touchTimer);
      dock.removeEventListener("pointerdown", onPointerDown, true);
      dock.removeEventListener("pointerenter", onPointerEnter);
      dock.removeEventListener("pointerleave", onPointerLeave);
      dock.removeEventListener("focusin", onFocusIn);
      dock.removeEventListener("focusout", onFocusOut);
    };
  }, [pinnedState]);

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

  const dockStyle = {
    "--pn-idle-scale": String(navConfig.idle.scale),
    "--pn-idle-touch-scale": String(navConfig.idle.touchScale),
    "--pn-idle-opacity": String(navConfig.idle.labelOpacity),
    "--pn-idle-ms": `${navConfig.idle.transitionMs}ms`,
    "--pn-hit-pad": `${navConfig.idle.hitPaddingPx}px`,
  } as CSSProperties;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-2"
      style={{
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${navConfig.bottomSpacingPx}px)`,
      }}
    >
      <div
        ref={dockRef}
        data-fade-surface={navConfig.idle.fadeSurface ? "true" : undefined}
        className="pill-nav-dock pointer-events-auto"
        style={dockStyle}
      >
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
