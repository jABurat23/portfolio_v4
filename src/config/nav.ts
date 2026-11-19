import { getZoneAtProgress, getZoneProgressRange } from "@/config/journey";
import { voidConfig } from "@/config/void";
import { worksConfig } from "@/config/works";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  targetProgress: number;
}

export interface NavConfig {
  ariaLabel: string;
  logoSrc: string;
  logoAlt: string;
  logoHref: string;
  narrowBreakpointPx: number;
  bottomSpacingPx: number;
  items: readonly NavItemConfig[];
}

function computeWorksTargetProgress(): number {
  const corridorRange = getZoneProgressRange("corridor");
  const count = worksConfig.items.length;
  if (count === 0) return corridorRange.startProgress;

  // Waypoints: entry (0) + frames (count) + exit (1); first frame rests at segment 2.
  const segments = count + 2;
  const firstFrameLocal = 2 / segments;
  return (
    corridorRange.startProgress +
    firstFrameLocal * (corridorRange.endProgress - corridorRange.startProgress)
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
  logoSrc: "/icon.svg",
  logoAlt: "Back to start",
  logoHref: "#home",
  narrowBreakpointPx: 768,
  bottomSpacingPx: 16,
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
