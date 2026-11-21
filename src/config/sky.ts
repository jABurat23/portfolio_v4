import { getZoneProgressRange } from "@/config/journey";

export interface SkyDensityKeyframe {
  zoneId: string;
  localProgress: number;
  countDesktop: number;
}

export interface SkyConfig {
  seed: number;
  domeRadius: number;
  cameraFar: number;
  minElevationDeg: number;
  maxElevationDeg: number;
  twoCellRatio: number;
  narrowBreakpointPx: number;
  narrowCountScale: number;
  driftRadiansPerSec: number;
  queryParam: string;
  keyframes: readonly SkyDensityKeyframe[];
}

export const skyConfig: SkyConfig = {
  seed: 202617,
  domeRadius: 135,
  cameraFar: 220,
  minElevationDeg: -10,
  maxElevationDeg: 42,
  twoCellRatio: 0.15,
  narrowBreakpointPx: 768,
  narrowCountScale: 0.55,
  driftRadiansPerSec: 0.0025,
  queryParam: "stars",
  keyframes: [
    { zoneId: "landscape", localProgress: 0, countDesktop: 140 },
    { zoneId: "corridor", localProgress: 0, countDesktop: 320 },
    { zoneId: "void", localProgress: 0, countDesktop: 620 },
    { zoneId: "void", localProgress: 1, countDesktop: 820 },
  ],
};

export function getMaxDesktopStarCount(): number {
  let maxCount = 0;
  for (const kf of skyConfig.keyframes) {
    if (kf.countDesktop > maxCount) {
      maxCount = kf.countDesktop;
    }
  }
  return maxCount;
}

export function getSkyZoneAnchorProgress(zoneId: string, localProgress: number): number {
  const { startProgress, endProgress } = getZoneProgressRange(zoneId);
  const clamped = Math.max(0, Math.min(1, localProgress));
  return startProgress + clamped * (endProgress - startProgress);
}

export function getSkyStarTargetCount(
  progress: number,
  isNarrow: boolean,
  tierMultiplier = 1,
): number {
  const keyframes = skyConfig.keyframes;
  if (keyframes.length === 0) return 0;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const scale =
    (isNarrow ? skyConfig.narrowCountScale : 1) * Math.max(0, tierMultiplier);

  if (keyframes.length === 1) {
    return Math.max(0, Math.round(keyframes[0].countDesktop * scale));
  }

  let rawCount = keyframes[keyframes.length - 1].countDesktop;

  const firstAnchor = getSkyZoneAnchorProgress(
    keyframes[0].zoneId,
    keyframes[0].localProgress,
  );
  if (clampedProgress <= firstAnchor) {
    rawCount = keyframes[0].countDesktop;
  } else {
    for (let i = 0; i < keyframes.length - 1; i += 1) {
      const kf0 = keyframes[i];
      const kf1 = keyframes[i + 1];
      const p0 = getSkyZoneAnchorProgress(kf0.zoneId, kf0.localProgress);
      const p1 = getSkyZoneAnchorProgress(kf1.zoneId, kf1.localProgress);

      if (clampedProgress <= p1 || i === keyframes.length - 2) {
        const span = Math.max(1e-6, p1 - p0);
        const t = Math.max(0, Math.min(1, (clampedProgress - p0) / span));
        const eased = t * t * (3 - 2 * t);
        rawCount = kf0.countDesktop + (kf1.countDesktop - kf0.countDesktop) * eased;
        break;
      }
    }
  }

  const maxAllowed = Math.max(0, Math.round(getMaxDesktopStarCount() * scale));
  return Math.max(0, Math.min(maxAllowed, Math.round(rawCount * scale)));
}
