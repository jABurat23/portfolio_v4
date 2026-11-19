export interface WorkItem {
  id: string;
  title: string;
  caption: string;
  image?: string;
  url?: string;
}

export interface CorridorLayoutConfig {
  entryZ: number;
  startZ: number;
  frameSpacingZ: number;
  frameOffsetX: number;
  frameWidth: number;
  frameHeight: number;
  beamThickness: number;
  frameDepth: number;
  frameYaw: number;
  cameraApproachZ: number;
  cameraHeight: number;
  vhPerFrame: number;
  causewayHalfWidth: number;
  causewayShoulderWidth: number;
  flattenStartZ: number;
  flattenEndZ: number;
  dwellStrength: number;
}

export interface WorksConfig {
  items: readonly WorkItem[];
  corridor: CorridorLayoutConfig;
}

export const worksConfig: WorksConfig = {
  items: [
    {
      id: "project-01",
      title: "PROJECT 01",
      caption: "COMING SOON",
    },
    {
      id: "project-02",
      title: "PROJECT 02",
      caption: "COMING SOON",
    },
    {
      id: "project-03",
      title: "PROJECT 03",
      caption: "COMING SOON",
    },
  ],
  corridor: {
    entryZ: -27,
    startZ: -46,
    frameSpacingZ: 15,
    frameOffsetX: 1.55,
    frameWidth: 2.15,
    frameHeight: 3.7,
    beamThickness: 0.15,
    frameDepth: 0.34,
    frameYaw: 0.14,
    cameraApproachZ: 11.2,
    cameraHeight: 2.15,
    vhPerFrame: 110,
    causewayHalfWidth: 6.5,
    causewayShoulderWidth: 9.0,
    flattenStartZ: -27,
    flattenEndZ: -38,
    dwellStrength: 0.38,
  },
};

export function getCorridorEndZ(): number {
  const count = Math.max(1, worksConfig.items.length);
  const { startZ, frameSpacingZ } = worksConfig.corridor;
  return startZ - (count - 1) * frameSpacingZ - 14;
}
