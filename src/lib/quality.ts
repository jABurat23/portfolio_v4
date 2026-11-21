import { landscapeConfig } from "@/config/landscape";
import {
  type QualityTierIndex,
  type QualityTierSpec,
  qualityConfig,
} from "@/config/quality";
import { skyConfig } from "@/config/sky";

export type ShadowOverride = boolean | null;

export interface ResolvedQualityState {
  tier: QualityTierIndex;
  forced: boolean;
  shadowOverride: ShadowOverride;
}

export interface EffectiveShadowSettings {
  enabled: boolean;
  mapSize: number;
}

function parseQualityTier(raw: string | null): QualityTierIndex | null {
  if (raw === "0") return 0;
  if (raw === "1") return 1;
  if (raw === "2") return 2;
  return null;
}

function parseShadowOverride(raw: string | null): ShadowOverride {
  if (raw === "0") return false;
  if (raw === "1") return true;
  return null;
}

export function getQualityTierSpec(tier: QualityTierIndex): QualityTierSpec {
  return qualityConfig.tiers[tier];
}

export function resolveEffectiveShadows(
  tierSpec: QualityTierSpec,
  shadowOverride: ShadowOverride,
): EffectiveShadowSettings {
  const enabled = shadowOverride ?? tierSpec.shadowsEnabled;
  if (!enabled) {
    return { enabled: false, mapSize: 0 };
  }
  return {
    enabled: true,
    mapSize: tierSpec.shadowMapSize || landscapeConfig.light.shadowMapSize,
  };
}

export function resolveInitialQuality(): ResolvedQualityState {
  if (typeof window === "undefined") {
    return {
      tier: qualityConfig.defaultTier,
      forced: false,
      shadowOverride: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const shadowOverride = parseShadowOverride(
    params.get(qualityConfig.shadowQueryParam),
  );
  const queryTier = parseQualityTier(params.get(qualityConfig.queryParam));
  if (queryTier !== null) {
    return { tier: queryTier, forced: true, shadowOverride };
  }

  try {
    const saved = parseQualityTier(
      window.sessionStorage.getItem(qualityConfig.sessionStorageKey),
    );
    if (saved !== null) {
      return { tier: saved, forced: false, shadowOverride };
    }
  } catch {
    // Ignore sessionStorage errors in restricted contexts.
  }

  return {
    tier: qualityConfig.defaultTier,
    forced: false,
    shadowOverride,
  };
}

export function saveQualityTier(tier: QualityTierIndex): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(qualityConfig.sessionStorageKey, String(tier));
  } catch {
    // Ignore sessionStorage errors in restricted contexts.
  }
}

export function resolveStarsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const params = new URLSearchParams(window.location.search);
  return params.get(skyConfig.queryParam) !== "0";
}
