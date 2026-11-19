"use client";

import { useEffect, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial, PlaneGeometry } from "three";
import { worksConfig } from "@/config/works";
import CorridorFrame from "./CorridorFrame";
import { createPlaceholderGradientTexture } from "./placeholderTexture";

export default function CorridorScene() {
  const resources = useMemo(() => {
    const { frameWidth, frameHeight, beamThickness, frameDepth } = worksConfig.corridor;
    const innerWidth = Math.max(0.2, frameWidth - beamThickness * 2);
    const innerHeight = Math.max(0.2, frameHeight - beamThickness * 2);

    const pillarGeometry = new BoxGeometry(beamThickness, frameHeight, frameDepth);
    const lintelGeometry = new BoxGeometry(innerWidth, beamThickness, frameDepth);
    const slotGeometry = new PlaneGeometry(innerWidth, innerHeight);

    const placeholderTexture = createPlaceholderGradientTexture();

    const frameMaterial = new MeshStandardMaterial({
      color: "#efefef",
      roughness: 0.85,
      metalness: 0,
    });

    const slotMaterial = new MeshStandardMaterial({
      map: placeholderTexture,
      emissive: "#ffffff",
      emissiveMap: placeholderTexture,
      emissiveIntensity: 0.38,
      roughness: 0.9,
      metalness: 0,
    });

    return {
      pillarGeometry,
      lintelGeometry,
      slotGeometry,
      placeholderTexture,
      frameMaterial,
      slotMaterial,
    };
  }, []);

  useEffect(() => {
    return () => {
      resources.pillarGeometry.dispose();
      resources.lintelGeometry.dispose();
      resources.slotGeometry.dispose();
      resources.placeholderTexture.dispose();
      resources.frameMaterial.dispose();
      resources.slotMaterial.dispose();
    };
  }, [resources]);

  const placements = useMemo(() => {
    const { startZ, frameSpacingZ, frameOffsetX, frameYaw } = worksConfig.corridor;
    return worksConfig.items.map((item, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * frameOffsetX;
      const z = startZ - index * frameSpacingZ;
      const rotationY = -side * frameYaw;
      return {
        item,
        position: [x, 0, z] as const,
        rotationY,
      };
    });
  }, []);

  return (
    <group>
      {placements.map(({ item, position, rotationY }) => (
        <CorridorFrame
          key={item.id}
          item={item}
          position={position}
          rotationY={rotationY}
          pillarGeometry={resources.pillarGeometry}
          lintelGeometry={resources.lintelGeometry}
          slotGeometry={resources.slotGeometry}
          frameMaterial={resources.frameMaterial}
          slotMaterial={resources.slotMaterial}
        />
      ))}
    </group>
  );
}
