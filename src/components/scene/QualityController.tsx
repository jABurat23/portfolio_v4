"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  DirectionalLight,
  type Material,
  Mesh,
  MeshStandardMaterial,
  type Scene,
  type WebGLRenderer,
} from "three";
import { type QualityTierIndex, qualityConfig } from "@/config/quality";
import {
  getQualityTierSpec,
  resolveEffectiveShadows,
  saveQualityTier,
  type ShadowOverride,
} from "@/lib/quality";

export interface QualityControllerProps {
  initialTier: QualityTierIndex;
  forced: boolean;
  shadowOverride: ShadowOverride;
  monitoringEnabled: boolean;
  isTabVisible: boolean;
}

function markSceneMaterialsDirty(scene: Scene): void {
  scene.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const mat = obj.material as Material | Material[] | undefined;
    if (!mat) return;
    if (Array.isArray(mat)) {
      for (const item of mat) {
        item.needsUpdate = true;
      }
    } else {
      mat.needsUpdate = true;
    }
  });
}

function applyTierToScene(
  gl: WebGLRenderer,
  scene: Scene,
  setDpr: (dpr: number) => void,
  tier: QualityTierIndex,
  shadowOverride: ShadowOverride,
): void {
  const spec = getQualityTierSpec(tier);
  const shadows = resolveEffectiveShadows(spec, shadowOverride);
  const targetDpr = Math.min(window.devicePixelRatio || 1, spec.maxDpr);
  setDpr(targetDpr);

  const prevShadowsEnabled = gl.shadowMap.enabled;
  gl.shadowMap.enabled = shadows.enabled;

  scene.traverse((obj) => {
    if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
      obj.castShadow = shadows.enabled;
      obj.receiveShadow = shadows.enabled;
      return;
    }

    if (!(obj instanceof DirectionalLight)) return;

    if (!shadows.enabled) {
      obj.castShadow = false;
      if (obj.shadow.map) {
        obj.shadow.map.dispose();
        obj.shadow.map = null;
      }
    } else {
      obj.castShadow = true;
      if (
        obj.shadow.mapSize.x !== shadows.mapSize ||
        obj.shadow.mapSize.y !== shadows.mapSize
      ) {
        if (obj.shadow.map) {
          obj.shadow.map.dispose();
          obj.shadow.map = null;
        }
        obj.shadow.mapSize.set(shadows.mapSize, shadows.mapSize);
        obj.shadow.needsUpdate = true;
      }
    }
  });

  if (prevShadowsEnabled !== shadows.enabled) {
    markSceneMaterialsDirty(scene);
  }

  gl.shadowMap.needsUpdate = true;
}

export default function QualityController({
  initialTier,
  forced,
  shadowOverride,
  monitoringEnabled,
  isTabVisible,
}: QualityControllerProps) {
  const { gl, scene, setDpr } = useThree();
  const tierRef = useRef<QualityTierIndex>(initialTier);
  const lastFrameMsRef = useRef<number | null>(null);
  const warmupStartMsRef = useRef<number | null>(null);
  const windowStartMsRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lowStreakRef = useRef(0);
  const lastStepMsRef = useRef<number>(-Infinity);

  useEffect(() => {
    applyTierToScene(gl, scene, setDpr, tierRef.current, shadowOverride);
  }, [gl, scene, setDpr, shadowOverride]);

  useEffect(() => {
    lastFrameMsRef.current = null;
    windowStartMsRef.current = null;
    frameCountRef.current = 0;
    lowStreakRef.current = 0;
    warmupStartMsRef.current =
      monitoringEnabled && isTabVisible ? performance.now() : null;
  }, [monitoringEnabled, isTabVisible]);

  useFrame(() => {
    if (forced || !monitoringEnabled || !isTabVisible || tierRef.current >= 2) {
      return;
    }

    const now = performance.now();
    if (warmupStartMsRef.current === null) {
      warmupStartMsRef.current = now;
      return;
    }

    if (now - warmupStartMsRef.current < qualityConfig.warmupMs) {
      lastFrameMsRef.current = now;
      return;
    }

    if (lastFrameMsRef.current === null) {
      lastFrameMsRef.current = now;
      windowStartMsRef.current = now;
      frameCountRef.current = 0;
      return;
    }

    const deltaMs = now - lastFrameMsRef.current;
    lastFrameMsRef.current = now;

    // Discard tab-switch or background resume stalls without triggering false step-downs.
    if (deltaMs > qualityConfig.maxFrameDeltaMs) {
      windowStartMsRef.current = now;
      frameCountRef.current = 0;
      lowStreakRef.current = 0;
      return;
    }

    frameCountRef.current += 1;
    const windowStart = windowStartMsRef.current ?? now;
    const elapsedMs = now - windowStart;

    if (elapsedMs < qualityConfig.sampleWindowMs) {
      return;
    }

    const fps = (frameCountRef.current * 1000) / Math.max(1, elapsedMs);
    windowStartMsRef.current = now;
    frameCountRef.current = 0;

    if (fps < qualityConfig.fpsThreshold) {
      lowStreakRef.current += 1;
    } else {
      lowStreakRef.current = 0;
      return;
    }

    if (
      lowStreakRef.current >= qualityConfig.consecutiveLowSamplesRequired &&
      now - lastStepMsRef.current >= qualityConfig.cooldownMs
    ) {
      const nextTier = Math.min(2, tierRef.current + 1) as QualityTierIndex;
      tierRef.current = nextTier;
      lowStreakRef.current = 0;
      lastStepMsRef.current = now;
      saveQualityTier(nextTier);
      applyTierToScene(gl, scene, setDpr, nextTier, shadowOverride);
    }
  });

  return null;
}
