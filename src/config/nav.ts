import { getZoneAtProgress, getZoneProgressRange } from "@/config/journey";
import { voidConfig } from "@/config/void";
import { worksConfig } from "@/config/works";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  targetProgress: number;
}

export interface NavIdleConfig {
  scale: number;
  touchScale: number;
  labelOpacity: number;
  fadeSurface: boolean;
  transitionMs: number;
  introHintMs: number;
  hoverLeaveDelayMs: number;
  focusLeaveDelayMs: number;
  touchRestDelayMs: number;
  hitPaddingPx: number;
  queryParam: string;
}

export interface NavConfig {
  ariaLabel: string;
  narrowBreakpointPx: number;
  bottomSpacingPx: number;
  idle: NavIdleConfig;
  items: readonly NavItemConfig[];
}

function computeWorksTargetProgress(): number {
  const corridorRange = getZoneProgressRange("corridor");
  const count = worksConfig.items.length;
  if (count === 0) return corridorRange.startProgress;

  // Waypoints: entry (0) + stops (count) + exit (1); first stop rests at segment 2.
  const segments = count + 2;
  const firstStopLocal = 2 / segments;
  return (
    corridorRange.startProgress +
    firstStopLocal * (corridorRange.endProgress - corridorRange.startProgress)
  );
}

function computeAboutTargetProgress(): number {
  const voidRange = getZoneProgressRange("void");
  const { aboutFadeInEnd, aboutHoldEnd } = voidConfig.panels;
  const localMid = (aboutFadeInEnd + aboutHoldEnd) * 0.5;
  return (
    voidRange.startProgress +
    localMid * (voidRange.endProgress - voidRange.startProgress)
  );
}

function computeContactTargetProgress(): number {
  const voidRange = getZoneProgressRange("void");
  const { contactFadeInEnd, backButtonFadeInEnd } = voidConfig.panels;
  const fullVisibilityStart = Math.max(contactFadeInEnd, backButtonFadeInEnd);
  const localTarget = (fullVisibilityStart + 1) * 0.5;
  return (
    voidRange.startProgress +
    localTarget * (voidRange.endProgress - voidRange.startProgress)
  );
}

export const navConfig: NavConfig = {
  ariaLabel: "Main",
  narrowBreakpointPx: 768,
  bottomSpacingPx: 16,
  idle: {
    scale: 0.82,
    touchScale: 0.9,
    labelOpacity: 0.45,
    fadeSurface: false,
    transitionMs: 260,
    introHintMs: 2500,
    hoverLeaveDelayMs: 350,
    focusLeaveDelayMs: 150,
    touchRestDelayMs: 2500,
    hitPaddingPx: 12,
    queryParam: "nav",
  },
  items: [
    {
      id: "home",
      label: "HOME",
      href: "#home",
      targetProgress: 0,
    },
    {
      id: "works",
      label: "WORKS",
      href: "#works",
      targetProgress: computeWorksTargetProgress(),
    },
    {
      id: "about",
      label: "ABOUT",
      href: "#about",
      targetProgress: computeAboutTargetProgress(),
    },
    {
      id: "contact",
      label: "CONTACT",
      href: "#contact",
      targetProgress: computeContactTargetProgress(),
    },
  ],
};

export function getNavTargetProgressForHash(hash: string): number | null {
  const normalized = hash.trim().toLowerCase();
  if (!normalized.startsWith("#")) return null;
  const entry = navConfig.items.find(
    (item) => item.href.toLowerCase() === normalized,
  );
  return entry ? entry.targetProgress : null;
}

export function getActiveNavHref(progress: number): string {
  const info = getZoneAtProgress(progress);

  if (info.zone.id === "corridor") {
    return "#works";
  }

  if (info.zone.id === "void") {
    return info.localProgress >= voidConfig.panels.contactFadeInStart
      ? "#contact"
      : "#about";
  }

  return "#home";
}

export type NavDockPinState = "awake" | "idle" | null;

export function parseNavQueryOverride(search?: string): NavDockPinState {
  if (typeof window === "undefined" && search === undefined) return null;
  const raw = new URLSearchParams(search ?? window.location.search).get(
    navConfig.idle.queryParam,
  );
  if (raw === "idle") return "idle";
  if (raw === "awake") return "awake";
  return null;
}
