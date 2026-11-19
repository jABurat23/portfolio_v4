"use client";

import type { BoxGeometry, MeshStandardMaterial, PlaneGeometry } from "three";
import { worksConfig, type WorkItem } from "@/config/works";

export interface CorridorFrameProps {
  item: WorkItem;
  position: readonly [number, number, number];
  rotationY: number;
  pillarGeometry: BoxGeometry;
  lintelGeometry: BoxGeometry;
  slotGeometry: PlaneGeometry;
  frameMaterial: MeshStandardMaterial;
  slotMaterial: MeshStandardMaterial;
}

export default function CorridorFrame({
  item,
  position,
  rotationY,
  pillarGeometry,
  lintelGeometry,
  slotGeometry,
  frameMaterial,
  slotMaterial,
}: CorridorFrameProps) {
  const { frameWidth, frameHeight, beamThickness } = worksConfig.corridor;
  const sideOffsetX = (frameWidth - beamThickness) * 0.5;
  const centerY = frameHeight * 0.5;
  const topY = frameHeight - beamThickness * 0.5;
  const bottomY = beamThickness * 0.5;

  // Extension point: when real project media is added, resolve `item.image` to a material/texture here.
  void item;

  return (
    <group position={[position[0], position[1], position[2]]} rotation={[0, rotationY, 0]}>
      <mesh
        geometry={pillarGeometry}
        material={frameMaterial}
        position={[-sideOffsetX, centerY, 0]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={pillarGeometry}
        material={frameMaterial}
        position={[sideOffsetX, centerY, 0]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={lintelGeometry}
        material={frameMaterial}
        position={[0, topY, 0]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={lintelGeometry}
        material={frameMaterial}
        position={[0, bottomY, 0]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={slotGeometry}
        material={slotMaterial}
        position={[0, centerY, 0]}
        receiveShadow
      />
    </group>
  );
}
