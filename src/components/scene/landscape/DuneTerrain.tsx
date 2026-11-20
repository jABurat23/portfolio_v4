"use client";

import { useEffect, useMemo } from "react";
import { PlaneGeometry } from "three";
import { landscapeConfig } from "@/config/landscape";
import { getTerrainBounds, sampleTerrainHeight } from "./terrainMath";

export interface DuneTerrainProps {
  shadowsEnabled?: boolean;
}

export default function DuneTerrain({ shadowsEnabled = true }: DuneTerrainProps) {
  const geometry = useMemo(() => {
    const { width, segmentsX, segmentsZ } = landscapeConfig.terrain;
    const { minZ, maxZ } = getTerrainBounds();
    const centerZ = (minZ + maxZ) * 0.5;

    const plane = new PlaneGeometry(width, maxZ - minZ, segmentsX, segmentsZ);
    plane.rotateX(-Math.PI / 2);
    plane.translate(0, 0, centerZ);

    const positions = plane.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      positions.setY(i, sampleTerrainHeight(x, z));
    }

    positions.needsUpdate = true;
    plane.computeVertexNormals();
    plane.computeBoundingBox();
    plane.computeBoundingSphere();
    return plane;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      receiveShadow={shadowsEnabled}
      castShadow={shadowsEnabled}
    >
      <meshStandardMaterial color="#e8e8e8" roughness={0.95} metalness={0} />
    </mesh>
  );
}
