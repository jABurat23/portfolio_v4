"use client";

import { useMemo } from "react";
import { landscapeConfig } from "@/config/landscape";
import { sampleTerrainHeight } from "./terrainMath";

export default function Monoliths() {
  const placements = useMemo(() => {
    return landscapeConfig.monoliths.map((monolith) => {
      const groundY = sampleTerrainHeight(monolith.x, monolith.z);
      const centerY = groundY - monolith.embedDepth + monolith.height * 0.5;
      return {
        ...monolith,
        y: centerY,
      };
    });
  }, []);

  return (
    <group>
      {placements.map((monolith) => (
        <mesh
          key={monolith.id}
          position={[monolith.x, monolith.y, monolith.z]}
          rotation={[0, monolith.rotationY, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[monolith.width, monolith.height, monolith.depth]}
          />
          <meshStandardMaterial color="#f2f2f2" roughness={0.85} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}
