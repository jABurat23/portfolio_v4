"use client";

import { Canvas } from "@react-three/fiber";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PCFShadowMap } from "three";
import { landscapeConfig } from "@/config/landscape";
import { type QualityTierSpec } from "@/config/quality";
import { skyConfig } from "@/config/sky";
import {
  getQualityTierSpec,
  resolveEffectiveShadows,
  resolveInitialQuality,
  resolveStarsEnabled,
} from "@/lib/quality";
import CameraRig from "./CameraRig";
import DitherPass from "./DitherPass";
import LandscapeScene from "./landscape/LandscapeScene";
import QualityController from "./QualityController";
import SkyStars from "./sky/SkyStars";
import VoidScene from "./void/VoidScene";

export interface SceneCanvasProps {
  onReady?: () => void;
  onContextLost?: () => void;
  thresholdBiasRef?: RefObject<number>;
  introDone?: boolean;
}

export default function SceneCanvas({
  onReady,
  onContextLost,
  thresholdBiasRef,
  introDone = false,
}: SceneCanvasProps) {
  const [isTabVisible, setIsTabVisible] = useState(true);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const contextLostHandlerRef = useRef<((event: Event) => void) | null>(null);
  const onContextLostRef = useRef(onContextLost);

  const initialQuality = useMemo(() => resolveInitialQuality(), []);
  const starsEnabled = useMemo(() => resolveStarsEnabled(), []);
  const initialTierSpec = getQualityTierSpec(initialQuality.tier);
  const starMultiplierRef = useRef(initialTierSpec.starCountMultiplier);
  const initialShadows = resolveEffectiveShadows(
    initialTierSpec,
    initialQuality.shadowOverride,
  );

  const handleTierChange = useCallback((spec: QualityTierSpec) => {
    starMultiplierRef.current = spec.starCountMultiplier;
  }, []);

  useEffect(() => {
    onContextLostRef.current = onContextLost;
  }, [onContextLost]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState !== "hidden");
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    return () => {
      const el = canvasElRef.current;
      const handler = contextLostHandlerRef.current;
      if (el && handler) {
        el.removeEventListener("webglcontextlost", handler);
        el.removeEventListener("webglcontextcreationerror", handler);
      }
    };
  }, []);

  const [camX, camY, camZ] = landscapeConfig.camera.position;

  return (
    <Canvas
      aria-hidden="true"
      shadows={initialShadows.enabled ? { type: PCFShadowMap } : false}
      dpr={[1, initialTierSpec.maxDpr]}
      frameloop={isTabVisible ? "always" : "never"}
      camera={{
        position: [camX, camY, camZ],
        fov: landscapeConfig.camera.fov,
        near: 0.1,
        far: skyConfig.cameraFar,
      }}
      className="h-full w-full"
      onCreated={({ gl }) => {
        const dom = gl.domElement;
        canvasElRef.current = dom;
        dom.setAttribute("aria-hidden", "true");
        const handleContextLost = (event: Event) => {
          event.preventDefault();
          onContextLostRef.current?.();
        };
        contextLostHandlerRef.current = handleContextLost;
        dom.addEventListener("webglcontextlost", handleContextLost);
        dom.addEventListener("webglcontextcreationerror", handleContextLost);
        onReady?.();
      }}
    >
      <CameraRig />
      {starsEnabled ? (
        <SkyStars qualityMultiplierRef={starMultiplierRef} />
      ) : null}
      <LandscapeScene
        initialShadowsEnabled={initialShadows.enabled}
        initialShadowMapSize={initialShadows.mapSize}
      />
      <VoidScene />
      <QualityController
        initialTier={initialQuality.tier}
        forced={initialQuality.forced}
        shadowOverride={initialQuality.shadowOverride}
        monitoringEnabled={introDone}
        isTabVisible={isTabVisible}
        onTierChange={handleTierChange}
      />
      <DitherPass thresholdBiasRef={thresholdBiasRef} />
    </Canvas>
  );
}
