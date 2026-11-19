"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { DirectionalLight } from "three";
import { landscapeConfig } from "@/config/landscape";
import DuneTerrain from "./DuneTerrain";

export interface LandscapeSceneProps {
  initialShadowsEnabled?: boolean;
  initialShadowMapSize?: number;
}

export default function LandscapeScene({
  initialShadowsEnabled = true,
  initialShadowMapSize = landscapeConfig.light.shadowMapSize,
}: LandscapeSceneProps) {
  const { scene, camera } = useThree();
  const lightRef = useRef<DirectionalLight>(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    const [tx, ty, tz] = landscapeConfig.light.target;
    light.target.position.set(tx, ty, tz);
    light.target.updateMatrixWorld();
    scene.add(light.target);

    return () => {
      scene.remove(light.target);
    };
  }, [scene]);

  useFrame(() => {
    const light = lightRef.current;
    if (!light) return;

    const { light: lightCfg, camera: cameraCfg } = landscapeConfig;
    const targetLeadZ = lightCfg.target[2] - cameraCfg.position[2];
    const offsetX = lightCfg.position[0] - lightCfg.target[0];
    const offsetY = lightCfg.position[1] - lightCfg.target[1];
    const offsetZ = lightCfg.position[2] - lightCfg.target[2];

    const targetZ = camera.position.z + targetLeadZ;
    light.target.position.set(lightCfg.target[0], lightCfg.target[1], targetZ);
    light.target.updateMatrixWorld();
    light.position.set(
      lightCfg.target[0] + offsetX,
      lightCfg.target[1] + offsetY,
      targetZ + offsetZ,
    );
  });

  const { light, fog } = landscapeConfig;

  return (
    <>
      <color attach="background" args={[fog.color]} />
      <fog attach="fog" args={[fog.color, fog.near, fog.far]} />

      <directionalLight
        ref={lightRef}
        position={[light.position[0], light.position[1], light.position[2]]}
        intensity={light.intensity}
        color={light.color}
        castShadow={initialShadowsEnabled}
        shadow-mapSize={[
          initialShadowMapSize || landscapeConfig.light.shadowMapSize,
          initialShadowMapSize || landscapeConfig.light.shadowMapSize,
        ]}
        shadow-camera-left={-light.shadowFrustum}
        shadow-camera-right={light.shadowFrustum}
        shadow-camera-top={light.shadowFrustum}
        shadow-camera-bottom={-light.shadowFrustum}
        shadow-camera-near={light.shadowNear}
        shadow-camera-far={light.shadowFar}
        shadow-bias={light.shadowBias}
        shadow-normalBias={light.shadowNormalBias}
      />

      <DuneTerrain />
    </>
  );
}
