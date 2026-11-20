export interface WorkItem {
  id: string;
  title: string;
  caption: string;
  description?: string | null;
  image?: string | null;
  url?: string | null;
}

export interface CorridorLayoutConfig {
  entryZ: number;
  startZ: number;
  stopSpacingZ: number;
  cameraApproachZ: number;
  cameraHeight: number;
  vhPerStop: number;
  causewayHalfWidth: number;
  causewayShoulderWidth: number;
  flattenStartZ: number;
  flattenEndZ: number;
  dwellStrength: number;
}

export interface CorridorCardConfig {
  focusHalfWindowSegments: number;
  plateauRatio: number;
  activeThreshold: number;
}

export interface WorksConfig {
  items: readonly WorkItem[];
  corridor: CorridorLayoutConfig;
  card: CorridorCardConfig;
}

export const worksConfig: WorksConfig = {
  items: [
    {
      id: "project-01",
      title: "PROJECT 01",
      caption: "COMING SOON",
      description: null,
    },
    {
      id: "project-02",
      title: "PROJECT 02",
      caption: "COMING SOON",
      description: null,
    },
    {
      id: "project-03",
      title: "PROJECT 03",
      caption: "COMING SOON",
      description: null,
    },
  ],
  corridor: {
    entryZ: -27,
    startZ: -46,
    stopSpacingZ: 15,
    cameraApproachZ: 11.2,
    cameraHeight: 2.15,
    vhPerStop: 110,
    causewayHalfWidth: 6.5,
    causewayShoulderWidth: 9.0,
    flattenStartZ: -27,
    flattenEndZ: -38,
    dwellStrength: 0.38,
  },
  card: {
    focusHalfWindowSegments: 0.48,
    plateauRatio: 0.75,
    activeThreshold: 0.5,
  },
};

export function getCorridorEndZ(): number {
  const count = Math.max(1, worksConfig.items.length);
  const { startZ, stopSpacingZ } = worksConfig.corridor;
  return startZ - (count - 1) * stopSpacingZ - 14;
}
