"use client";

import { Canvas } from "@react-three/fiber";
import { type RefObject, useEffect, useState } from "react";
import { PCFShadowMap } from "three";
import { ditherConfig } from "@/config/dither";
import { landscapeConfig } from "@/config/landscape";
import CameraRig from "./CameraRig";
import CorridorScene from "./corridor/CorridorScene";
import DitherPass from "./DitherPass";
import LandscapeScene from "./landscape/LandscapeScene";
import VoidScene from "./void/VoidScene";

export interface SceneCanvasProps {
  onReady?: () => void;
  thresholdBiasRef?: RefObject<number>;
}

export default function SceneCanvas({
  onReady,
  thresholdBiasRef,
}: SceneCanvasProps) {
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState !== "hidden");
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const [camX, camY, camZ] = landscapeConfig.camera.position;

  return (
    <Canvas
      aria-hidden="true"
      shadows={{ type: PCFShadowMap }}
      dpr={[1, ditherConfig.maxDpr]}
      frameloop={isTabVisible ? "always" : "never"}
      camera={{
        position: [camX, camY, camZ],
        fov: landscapeConfig.camera.fov,
        near: 0.1,
        far: 150,
      }}
      className="h-full w-full"
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        onReady?.();
      }}
    >
      <CameraRig />
      <LandscapeScene />
      <CorridorScene />
      <VoidScene />
      <DitherPass thresholdBiasRef={thresholdBiasRef} />
    </Canvas>
  );
}
