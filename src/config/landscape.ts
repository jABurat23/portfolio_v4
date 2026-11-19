export interface LandscapeConfig {
  terrain: {
    width: number;
    depth: number;
    segmentsX: number;
    segmentsZ: number;
    duneHeight: number;
    noiseScale: number;
    ridgeFrequency: number;
    ridgeStrength: number;
    foregroundClearZ: number;
  };
  light: {
    position: readonly [number, number, number];
    target: readonly [number, number, number];
    intensity: number;
    color: string;
    shadowMapSize: number;
    shadowFrustum: number;
    shadowNear: number;
    shadowFar: number;
    shadowBias: number;
    shadowNormalBias: number;
  };
  fog: {
    color: string;
    near: number;
    far: number;
  };
  camera: {
    fov: number;
    position: readonly [number, number, number];
    target: readonly [number, number, number];
    driftAmplitudeX: number;
    driftAmplitudeY: number;
    driftSpeed: number;
    parallaxX: number;
    parallaxY: number;
    damping: number;
  };
}

export const landscapeConfig: LandscapeConfig = {
  terrain: {
    width: 120,
    depth: 160,
    segmentsX: 64,
    segmentsZ: 96,
    duneHeight: 3.1,
    noiseScale: 0.048,
    ridgeFrequency: 0.11,
    ridgeStrength: 0.8,
    foregroundClearZ: 7,
  },
  light: {
    position: [-26, 7.2, -4],
    target: [0, 0, -14],
    intensity: 2.75,
    color: "#ffffff",
    shadowMapSize: 1024,
    shadowFrustum: 28,
    shadowNear: 1,
    shadowFar: 80,
    shadowBias: -0.0004,
    shadowNormalBias: 0.04,
  },
  fog: {
    color: "#000000",
    near: 14,
    far: 56,
  },
  camera: {
    fov: 46,
    position: [0, 2.5, 11],
    target: [0, 1.9, -18],
    driftAmplitudeX: 0.45,
    driftAmplitudeY: 0.16,
    driftSpeed: 0.12,
    parallaxX: 0.65,
    parallaxY: 0.28,
    damping: 2.8,
  },
};
