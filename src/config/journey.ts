import { voidConfig } from "@/config/void";
import { getCorridorEndZ, type WorkItem, worksConfig } from "@/config/works";

export interface JourneyWaypoint {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
}

export interface JourneyZone {
  id: string;
  scrollVh: number;
  waypoints: readonly JourneyWaypoint[];
}

export interface SmoothScrollConfig {
  lerp: number;
  wheelMultiplier: number;
  syncTouch: false;
}

export interface JourneyConfig {
  zones: readonly JourneyZone[];
  smoothScroll: SmoothScrollConfig;
  cameraClearance: number;
  scrollDamping: number;
  driftScale: number;
  parallaxScale: number;
  heroFadeEndProgress: number;
  heroDriftPx: number;
  scrollHintHideProgress: number;
}

export interface ActiveZoneInfo {
  zone: JourneyZone;
  index: number;
  localProgress: number;
  startProgress: number;
  endProgress: number;
}

export interface CorridorFrameFocus {
  index: number;
  item: WorkItem;
  side: "left" | "right";
  opacity: number;
  active: boolean;
}

function buildCorridorWaypoints(): JourneyWaypoint[] {
  const {
    entryZ,
    startZ,
    frameSpacingZ,
    cameraApproachZ,
    cameraHeight,
  } = worksConfig.corridor;
  const items = worksConfig.items;

  const waypoints: JourneyWaypoint[] = [
    {
      position: [0.6, 2.5, entryZ],
      target: [0, cameraHeight, startZ - 4],
    },
  ];

  for (let i = 0; i < items.length; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const frameZ = startZ - i * frameSpacingZ;
    waypoints.push({
      position: [-side * 0.14, cameraHeight, frameZ + cameraApproachZ],
      target: [side * 0.78, cameraHeight - 0.15, frameZ - 1.5],
    });
  }

  const endZ = getCorridorEndZ();
  waypoints.push({
    position: [0, cameraHeight + 0.05, endZ + 8],
    target: [0, cameraHeight, endZ - 12],
  });

  return waypoints;
}

const landscapeWaypoints: readonly JourneyWaypoint[] = [
  { position: [0, 2.5, 11], target: [0, 1.9, -18] },
  { position: [-1.2, 2.7, 2.0], target: [-0.2, 1.85, -22] },
  { position: [0.9, 2.8, -7.5], target: [0.2, 1.9, -30] },
  { position: [0.4, 2.65, -16.5], target: [0.1, 2.0, -39] },
];

const corridorWaypoints = buildCorridorWaypoints();

function buildVoidWaypoints(): JourneyWaypoint[] {
  const endZ = getCorridorEndZ();
  const baseHeight = worksConfig.corridor.cameraHeight;

  return [
    {
      position: [0, baseHeight + 2.4, endZ - 4],
      target: [0, baseHeight + 4.1, endZ - 30],
    },
    {
      position: [-0.8, baseHeight + 7.1, endZ - 20],
      target: [0.4, baseHeight + 8.5, endZ - 48],
    },
    {
      position: [0.6, baseHeight + 10.4, endZ - 36],
      target: [0, baseHeight + 10.8, endZ - 68],
    },
    {
      position: [0, baseHeight + 11.8, endZ - 48],
      target: [0, baseHeight + 12.0, endZ - 82],
    },
  ];
}

const voidWaypoints = buildVoidWaypoints();

export const journeyConfig: JourneyConfig = {
  zones: [
    {
      id: "landscape",
      scrollVh: 250,
      waypoints: landscapeWaypoints,
    },
    {
      id: "corridor",
      scrollVh: Math.max(1, worksConfig.items.length) * worksConfig.corridor.vhPerFrame,
      waypoints: corridorWaypoints,
    },
    {
      id: "void",
      scrollVh: voidConfig.scrollVh,
      waypoints: voidWaypoints,
    },
  ],
  smoothScroll: {
    lerp: 0.085,
    wheelMultiplier: 0.9,
    syncTouch: false,
  },
  cameraClearance: 1.75,
  scrollDamping: 10,
  driftScale: 0.55,
  parallaxScale: 0.55,
  heroFadeEndProgress: 0.14,
  heroDriftPx: 48,
  scrollHintHideProgress: 0.015,
};

export function getTotalJourneyVh(): number {
  return journeyConfig.zones.reduce((sum, zone) => sum + zone.scrollVh, 0);
}

export interface ZoneProgressRange {
  startProgress: number;
  endProgress: number;
}

export function getZoneProgressRange(zoneId: string): ZoneProgressRange {
  const zones = journeyConfig.zones;
  const totalVh = Math.max(1, getTotalJourneyVh());

  let accumulatedVh = 0;
  for (const zone of zones) {
    const startProgress = accumulatedVh / totalVh;
    const endProgress = (accumulatedVh + zone.scrollVh) / totalVh;
    if (zone.id === zoneId) {
      return { startProgress, endProgress };
    }
    accumulatedVh += zone.scrollVh;
  }

  return { startProgress: 0, endProgress: 1 };
}

export function getZoneAtProgress(progress: number): ActiveZoneInfo {
  const zones = journeyConfig.zones;
  const totalVh = Math.max(1, getTotalJourneyVh());
  const clamped = Math.max(0, Math.min(1, progress));

  let accumulatedVh = 0;
  for (let i = 0; i < zones.length; i += 1) {
    const zone = zones[i];
    const startProgress = accumulatedVh / totalVh;
    const endProgress = (accumulatedVh + zone.scrollVh) / totalVh;
    if (clamped < endProgress || i === zones.length - 1) {
      const span = Math.max(0.0001, endProgress - startProgress);
      const localProgress = Math.max(
        0,
        Math.min(1, (clamped - startProgress) / span),
      );
      return { zone, index: i, localProgress, startProgress, endProgress };
    }
    accumulatedVh += zone.scrollVh;
  }

  return {
    zone: zones[0],
    index: 0,
    localProgress: 0,
    startProgress: 0,
    endProgress: 1,
  };
}

/**
 * Remaps corridor local progress (0..1) so the camera glides smoothly across the
 * gaps and gently dwells as it passes each work frame waypoint.
 */
export function remapCorridorProgress(localProgress: number): number {
  const u = Math.max(0, Math.min(1, localProgress));
  const count = worksConfig.items.length;
  if (count === 0) return u;

  // Corridor waypoints include entry (1) + frames (count) + exit (1), plus seam from landscape = count + 2 segments.
  const segments = count + 2;
  const halfWidth = 0.48 / segments;
  const strength = worksConfig.corridor.dwellStrength;

  let remapped = u;
  for (let i = 0; i < count; i += 1) {
    const center = (2 + i) / segments;
    const dist = (u - center) / halfWidth;
    remapped -= strength * halfWidth * dist * Math.exp(-dist * dist);
  }

  return Math.max(0, Math.min(1, remapped));
}

/**
 * Maps global scroll progress (0..1) to the normalized parameter t (0..1) along the
 * unified CatmullRomCurve3 built from all zone waypoints in order.
 */
export function mapProgressToCurveT(
  progress: number,
  applyDwell: boolean,
): number {
  const zones = journeyConfig.zones;
  const totalPoints = zones.reduce((sum, z) => sum + z.waypoints.length, 0);
  const totalSegments = Math.max(1, totalPoints - 1);

  const info = getZoneAtProgress(progress);
  let startSeg = 0;
  for (let i = 0; i < info.index; i += 1) {
    startSeg += zones[i].waypoints.length - (i === 0 ? 1 : 0);
  }

  // First zone uses (waypoints - 1) segments; each subsequent zone continues smoothly from the prior zone's end waypoint.
  const zoneSegs =
    info.index === 0
      ? Math.max(1, info.zone.waypoints.length - 1)
      : info.zone.waypoints.length;

  let local = info.localProgress;
  if (info.zone.id === "corridor" && applyDwell) {
    local = remapCorridorProgress(local);
  }

  const segPos = startSeg + local * zoneSegs;
  return Math.max(0, Math.min(1, segPos / totalSegments));
}

export function getCorridorFrameFocus(
  progress: number,
): CorridorFrameFocus | null {
  const info = getZoneAtProgress(progress);
  if (info.zone.id !== "corridor") return null;

  const items = worksConfig.items;
  if (items.length === 0) return null;

  const remapped = remapCorridorProgress(info.localProgress);
  const segments = items.length + 2;
  const { focusHalfWindowSegments, plateauRatio, activeThreshold } =
    worksConfig.card;
  const halfWindow = focusHalfWindowSegments / segments;

  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < items.length; i += 1) {
    const center = (2 + i) / segments;
    const d = Math.abs(remapped - center);
    if (d < closestDist) {
      closestDist = d;
      closestIdx = i;
    }
  }

  const ratio = Math.min(1, closestDist / Math.max(0.0001, halfWindow));
  let opacity = 1;
  if (ratio > plateauRatio) {
    const t = (ratio - plateauRatio) / Math.max(0.0001, 1 - plateauRatio);
    opacity = Math.max(0, 1 - t * t * (3 - 2 * t));
  }

  const item = items[closestIdx];
  const side: "left" | "right" = closestIdx % 2 === 0 ? "left" : "right";

  return {
    index: closestIdx,
    item,
    side,
    opacity,
    active: opacity >= activeThreshold,
  };
}

export interface VoidPanelsState {
  aboutOpacity: number;
  contactOpacity: number;
  backButtonOpacity: number;
  aboutActive: boolean;
  contactActive: boolean;
  backButtonActive: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothRamp(start: number, end: number, value: number): number {
  if (end <= start) return value >= start ? 1 : 0;
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

export function getVoidPanelsState(progress: number): VoidPanelsState {
  const info = getZoneAtProgress(progress);
  if (info.zone.id !== "void") {
    return {
      aboutOpacity: 0,
      contactOpacity: 0,
      backButtonOpacity: 0,
      aboutActive: false,
      contactActive: false,
      backButtonActive: false,
    };
  }

  const u = info.localProgress;
  const {
    aboutFadeInStart,
    aboutFadeInEnd,
    aboutHoldEnd,
    aboutFadeOutEnd,
    contactFadeInStart,
    contactFadeInEnd,
    backButtonFadeInStart,
    backButtonFadeInEnd,
    activeThreshold,
  } = voidConfig.panels;

  const aboutIn = smoothRamp(aboutFadeInStart, aboutFadeInEnd, u);
  const aboutOut = 1 - smoothRamp(aboutHoldEnd, aboutFadeOutEnd, u);
  const aboutOpacity = clamp01(Math.min(aboutIn, aboutOut));

  const contactOpacity = smoothRamp(contactFadeInStart, contactFadeInEnd, u);
  const backButtonOpacity = smoothRamp(backButtonFadeInStart, backButtonFadeInEnd, u);

  return {
    aboutOpacity,
    contactOpacity,
    backButtonOpacity,
    aboutActive: aboutOpacity >= activeThreshold,
    contactActive: contactOpacity >= activeThreshold,
    backButtonActive: backButtonOpacity >= activeThreshold,
  };
}
