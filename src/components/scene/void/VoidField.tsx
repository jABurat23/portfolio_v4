"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  Color,
  type Group,
  type InstancedMesh,
  MeshBasicMaterial,
  Object3D,
} from "three";
import { voidConfig } from "@/config/void";
import { getCorridorEndZ } from "@/config/works";

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const _dummy = new Object3D();
const _color = new Color();

export default function VoidField() {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const reducedMotionRef = useRef(false);
  const driftTimeRef = useRef(0);

  const layout = useMemo(() => {
    const { field } = voidConfig;
    const isNarrow =
      typeof window !== "undefined" && window.innerWidth < field.narrowBreakpointPx;
    const dotCount = isNarrow ? field.dotCountMobile : field.dotCountDesktop;
    const lineCount = isNarrow ? field.lineCountMobile : field.lineCountDesktop;
    const totalCount = dotCount + lineCount * field.pointsPerLine;

    return {
      dotCount,
      lineCount,
      totalCount,
      originZ: getCorridorEndZ() - field.startZOffset,
    };
  }, []);

  const { geometry, material } = useMemo(() => {
    return {
      geometry: new BoxGeometry(1, 1, 1),
      material: new MeshBasicMaterial({
        color: "#ffffff",
        fog: true,
      }),
    };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { field } = voidConfig;
    const rand = createSeededRandom(202407);
    const { dotCount, lineCount, originZ } = layout;

    let instanceIndex = 0;

    // Standalone floating dots sized >= 1 Bayer cell so they survive ordered dithering.
    for (let i = 0; i < dotCount; i += 1) {
      const x = (rand() * 2 - 1) * field.boundsX;
      const y = field.boundsYMin + rand() * (field.boundsYMax - field.boundsYMin);
      const z = originZ - rand() * field.depthSpanZ;
      const scale = field.dotSize * (0.85 + rand() * 0.4);

      _dummy.position.set(x, y, z);
      _dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, 0);
      _dummy.scale.setScalar(scale);
      _dummy.updateMatrix();
      mesh.setMatrixAt(instanceIndex, _dummy.matrix);

      const shade =
        field.minIntensity + rand() * (field.maxIntensity - field.minIntensity);
      _color.setRGB(shade, shade, shade);
      mesh.setColorAt(instanceIndex, _color);
      instanceIndex += 1;
    }

    // Dotted lines built from chains of dither-cell-sized cubes so 1px lines never vanish.
    for (let l = 0; l < lineCount; l += 1) {
      const startX = (rand() * 2 - 1) * (field.boundsX * 0.85);
      const startY =
        field.boundsYMin + 1 + rand() * (field.boundsYMax - field.boundsYMin - 2);
      const startZ = originZ - 4 - rand() * (field.depthSpanZ - 12);

      const length =
        field.lineLengthMin + rand() * (field.lineLengthMax - field.lineLengthMin);
      const theta = rand() * Math.PI * 2;
      const phi = (rand() - 0.5) * 0.85;
      const dx = Math.cos(theta) * Math.cos(phi) * length;
      const dy = Math.sin(phi) * length;
      const dz = Math.sin(theta) * Math.cos(phi) * length;

      const lineShade =
        field.minIntensity +
        0.12 +
        rand() * Math.max(0.05, field.maxIntensity - field.minIntensity - 0.12);

      for (let p = 0; p < field.pointsPerLine; p += 1) {
        const t = field.pointsPerLine > 1 ? p / (field.pointsPerLine - 1) : 0;
        _dummy.position.set(startX + dx * t, startY + dy * t, startZ + dz * t);
        _dummy.rotation.set(0, theta, 0);
        _dummy.scale.setScalar(field.lineDotSize);
        _dummy.updateMatrix();
        mesh.setMatrixAt(instanceIndex, _dummy.matrix);

        _color.setRGB(lineShade, lineShade, lineShade);
        mesh.setColorAt(instanceIndex, _color);
        instanceIndex += 1;
      }
    }

    mesh.count = instanceIndex;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
  }, [layout]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches && groupRef.current) {
        groupRef.current.position.set(0, 0, 0);
        groupRef.current.rotation.set(0, 0, 0);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const group = groupRef.current;
    if (!group || reducedMotionRef.current) return;

    const delta = Math.min(rawDelta, 0.1);
    driftTimeRef.current += delta;
    const t = driftTimeRef.current;
    const { driftSpeed, driftAmplitudeX, driftAmplitudeY, rotationSpeedY } =
      voidConfig.field;

    group.position.x = Math.sin(t * driftSpeed) * driftAmplitudeX;
    group.position.y = Math.cos(t * driftSpeed * 0.78) * driftAmplitudeY;
    group.rotation.y = Math.sin(t * rotationSpeedY) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, layout.totalCount]}
        frustumCulled={false}
      />
    </group>
  );
}
