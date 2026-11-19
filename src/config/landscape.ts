export interface MonolithSpec {
  id: string;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotationY: number;
  embedDepth: number;
}

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
  monoliths: MonolithSpec[];
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
  scrollHint: string;
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
  monoliths: [
    {
      id: "monolith-near-right",
      x: 5.4,
      z: -12,
      width: 1.05,
      height: 5.8,
      depth: 0.9,
      rotationY: -0.28,
      embedDepth: 0.7,
    },
    {
      id: "monolith-mid-left",
      x: -7.8,
      z: -15.5,
      width: 1.25,
      height: 6.6,
      depth: 0.95,
      rotationY: 0.42,
      embedDepth: 0.75,
    },
    {
      id: "monolith-far-right",
      x: 13.5,
      z: -24,
      width: 1.4,
      height: 8.2,
      depth: 1.05,
      rotationY: 0.22,
      embedDepth: 0.85,
    },
    {
      id: "monolith-far-center",
      x: -1.6,
      z: -25,
      width: 1.15,
      height: 7.4,
      depth: 0.95,
      rotationY: -0.36,
      embedDepth: 0.75,
    },
  ],
  light: {
    position: [-26, 8.0, -4],
    target: [0, 0, -14],
    intensity: 2.6,
    color: "#ffffff",
    shadowMapSize: 1024,
    shadowFrustum: 34,
    shadowNear: 1,
    shadowFar: 85,
    shadowBias: -0.0005,
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
    target: [0, 2.0, -18],
    driftAmplitudeX: 0.45,
    driftAmplitudeY: 0.16,
    driftSpeed: 0.12,
    parallaxX: 0.65,
    parallaxY: 0.28,
    damping: 2.8,
  },
  scrollHint: "SCROLL",
};
