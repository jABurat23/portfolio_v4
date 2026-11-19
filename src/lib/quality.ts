import {
  type QualityTierIndex,
  type QualityTierSpec,
  qualityConfig,
} from "@/config/quality";

export interface ResolvedQualityState {
  tier: QualityTierIndex;
  forced: boolean;
}

function parseQualityTier(raw: string | null): QualityTierIndex | null {
  if (raw === "0") return 0;
  if (raw === "1") return 1;
  if (raw === "2") return 2;
  return null;
}

export function getQualityTierSpec(tier: QualityTierIndex): QualityTierSpec {
  return qualityConfig.tiers[tier];
}

export function resolveInitialQuality(): ResolvedQualityState {
  if (typeof window === "undefined") {
    return { tier: qualityConfig.defaultTier, forced: false };
  }

  const params = new URLSearchParams(window.location.search);
  const queryTier = parseQualityTier(params.get(qualityConfig.queryParam));
  if (queryTier !== null) {
    return { tier: queryTier, forced: true };
  }

  try {
    const saved = parseQualityTier(
      window.sessionStorage.getItem(qualityConfig.sessionStorageKey),
    );
    if (saved !== null) {
      return { tier: saved, forced: false };
    }
  } catch {
    // Ignore sessionStorage errors in restricted contexts.
  }

  return { tier: qualityConfig.defaultTier, forced: false };
}

export function saveQualityTier(tier: QualityTierIndex): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(qualityConfig.sessionStorageKey, String(tier));
  } catch {
    // Ignore sessionStorage errors in restricted contexts.
  }
}
