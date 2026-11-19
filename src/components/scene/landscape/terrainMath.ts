import { landscapeConfig } from "@/config/landscape";
import { getCorridorEndZ, worksConfig } from "@/config/works";
import { fbm2D } from "@/lib/noise";

export interface TerrainBounds {
  minZ: number;
  maxZ: number;
}

export function getTerrainBounds(): TerrainBounds {
  return {
    minZ: getCorridorEndZ() - 2,
    maxZ: 45,
  };
}

export function hasTerrainAt(z: number): boolean {
  const { minZ, maxZ } = getTerrainBounds();
  return z >= minZ && z <= maxZ;
}

function smoothstepRange(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function sampleTerrainHeight(x: number, z: number): number {
  const {
    duneHeight,
    noiseScale,
    ridgeFrequency,
    ridgeStrength,
    foregroundClearZ,
  } = landscapeConfig.terrain;

  const baseNoise = fbm2D(x * noiseScale + 13.7, z * noiseScale - 5.3, 4, 2.05, 0.5);
  const crestWave =
    Math.sin(x * ridgeFrequency + (baseNoise - 0.5) * 3.1) *
    Math.cos(z * (ridgeFrequency * 0.75) + 0.6);

  let height = (baseNoise - 0.45) * duneHeight + crestWave * ridgeStrength;

  // Keep foreground right in front of the camera low so dunes never clip the lens.
  if (z > foregroundClearZ) {
    const t = Math.min(1, (z - foregroundClearZ) / 8);
    const blend = 1 - t * t * (3 - 2 * t) * 0.75;
    height *= blend;
  }

  // Smoothly flatten dunes into a level causeway beyond the far monoliths.
  const {
    flattenStartZ,
    flattenEndZ,
    causewayHalfWidth,
    causewayShoulderWidth,
  } = worksConfig.corridor;

  if (z < flattenStartZ) {
    const zBlend = smoothstepRange(flattenStartZ, flattenEndZ, z);
    const radialDist = Math.abs(x);
    const sideMask =
      1 -
      smoothstepRange(
        causewayHalfWidth,
        causewayHalfWidth + causewayShoulderWidth,
        radialDist,
      );
    const flattenFactor = zBlend * sideMask;
    height *= 1 - flattenFactor;
  }

  return height;
}
