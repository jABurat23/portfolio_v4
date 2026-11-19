import { ditherConfig } from "@/config/dither";
import { landscapeConfig } from "@/config/landscape";

export type QualityTierIndex = 0 | 1 | 2;

export interface QualityTierSpec {
  tier: QualityTierIndex;
  maxDpr: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
}

export interface QualityConfig {
  tiers: readonly [QualityTierSpec, QualityTierSpec, QualityTierSpec];
  defaultTier: QualityTierIndex;
  queryParam: string;
  sessionStorageKey: string;
  warmupMs: number;
  sampleWindowMs: number;
  fpsThreshold: number;
  consecutiveLowSamplesRequired: number;
  cooldownMs: number;
  maxFrameDeltaMs: number;
}

export const qualityConfig: QualityConfig = {
  tiers: [
    {
      tier: 0,
      maxDpr: ditherConfig.maxDpr,
      shadowsEnabled: true,
      shadowMapSize: landscapeConfig.light.shadowMapSize,
    },
    {
      tier: 1,
      maxDpr: 1,
      shadowsEnabled: true,
      shadowMapSize: 512,
    },
    {
      tier: 2,
      maxDpr: 1,
      shadowsEnabled: false,
      shadowMapSize: 0,
    },
  ],
  defaultTier: 0,
  queryParam: "quality",
  sessionStorageKey: "agustin_quality_tier",
  warmupMs: 3500,
  sampleWindowMs: 1000,
  fpsThreshold: 45,
  consecutiveLowSamplesRequired: 3,
  cooldownMs: 4000,
  maxFrameDeltaMs: 250,
};
