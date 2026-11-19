"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { journeyConfig, mapProgressToCurveT } from "@/config/journey";
import { landscapeConfig } from "@/config/landscape";
import { getScrollProgress } from "@/lib/scrollProgress";
import { hasTerrainAt, sampleTerrainHeight } from "./landscape/terrainMath";

const _curvePos = new Vector3();
const _curveTarget = new Vector3();

export default function CameraRig() {
  const { camera } = useThree();
  const reducedMotionRef = useRef(false);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerSmoothedRef = useRef({ x: 0, y: 0 });
  const smoothedProgressRef = useRef(getScrollProgress());
  const driftTimeRef = useRef(0);

  const { positionCurve, targetCurve } = useMemo(() => {
    const waypoints = journeyConfig.zones.flatMap((zone) => zone.waypoints);
    const positionPoints = waypoints.map(
      (wp) => new Vector3(wp.position[0], wp.position[1], wp.position[2]),
    );
    const targetPoints = waypoints.map(
      (wp) => new Vector3(wp.target[0], wp.target[1], wp.target[2]),
    );
    return {
      positionCurve: new CatmullRomCurve3(positionPoints, false, "catmullrom", 0.5),
      targetCurve: new CatmullRomCurve3(targetPoints, false, "catmullrom", 0.5),
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    // Snap camera to initial scroll progress immediately on mount/reload.
    const initialProgress = Math.max(0, Math.min(1, getScrollProgress()));
    smoothedProgressRef.current = initialProgress;
    const initialT = mapProgressToCurveT(initialProgress, !mediaQuery.matches);
    positionCurve.getPoint(initialT, _curvePos);
    targetCurve.getPoint(initialT, _curveTarget);
    const camY = hasTerrainAt(_curvePos.z)
      ? Math.max(
          _curvePos.y,
          sampleTerrainHeight(_curvePos.x, _curvePos.z) + journeyConfig.cameraClearance,
        )
      : _curvePos.y;
    camera.position.set(_curvePos.x, camY, _curvePos.z);
    camera.lookAt(_curveTarget);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) {
        pointerTargetRef.current.x = 0;
        pointerTargetRef.current.y = 0;
        pointerSmoothedRef.current.x = 0;
        pointerSmoothedRef.current.y = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotionRef.current) return;
      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      pointerTargetRef.current.x = nx;
      pointerTargetRef.current.y = -ny;
    };

    const handlePointerLeave = () => {
      pointerTargetRef.current.x = 0;
      pointerTargetRef.current.y = 0;
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [camera, positionCurve, targetCurve]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const rawProgress = getScrollProgress();

    if (reducedMotionRef.current) {
      smoothedProgressRef.current = rawProgress;
      const curveT = mapProgressToCurveT(rawProgress, false);
      positionCurve.getPoint(curveT, _curvePos);
      targetCurve.getPoint(curveT, _curveTarget);

      const camY = hasTerrainAt(_curvePos.z)
        ? Math.max(
            _curvePos.y,
            sampleTerrainHeight(_curvePos.x, _curvePos.z) + journeyConfig.cameraClearance,
          )
        : _curvePos.y;
      camera.position.set(_curvePos.x, camY, _curvePos.z);
      camera.lookAt(_curveTarget);
      return;
    }

    smoothedProgressRef.current = MathUtils.damp(
      smoothedProgressRef.current,
      rawProgress,
      journeyConfig.scrollDamping,
      delta,
    );
    const curveT = mapProgressToCurveT(smoothedProgressRef.current, true);

    positionCurve.getPoint(curveT, _curvePos);
    targetCurve.getPoint(curveT, _curveTarget);

    const {
      driftAmplitudeX,
      driftAmplitudeY,
      driftSpeed,
      parallaxX,
      parallaxY,
      damping,
    } = landscapeConfig.camera;

    driftTimeRef.current += delta;
    const t = driftTimeRef.current;

    pointerSmoothedRef.current.x = MathUtils.damp(
      pointerSmoothedRef.current.x,
      pointerTargetRef.current.x,
      damping,
      delta,
    );
    pointerSmoothedRef.current.y = MathUtils.damp(
      pointerSmoothedRef.current.y,
      pointerTargetRef.current.y,
      damping,
      delta,
    );

    const driftX =
      Math.sin(t * driftSpeed) * driftAmplitudeX * journeyConfig.driftScale;
    const driftY =
      Math.cos(t * driftSpeed * 0.73) * driftAmplitudeY * journeyConfig.driftScale;

    const px = pointerSmoothedRef.current.x * parallaxX * journeyConfig.parallaxScale;
    const py = pointerSmoothedRef.current.y * parallaxY * journeyConfig.parallaxScale;

    const camX = _curvePos.x + driftX + px;
    const camZ = _curvePos.z;
    const rawCamY = _curvePos.y + driftY + py;
    const camY = hasTerrainAt(camZ)
      ? Math.max(rawCamY, sampleTerrainHeight(camX, camZ) + journeyConfig.cameraClearance)
      : rawCamY;

    camera.position.set(camX, camY, camZ);
    _curveTarget.set(
      _curveTarget.x + driftX * 0.35 + px * 0.35,
      _curveTarget.y + driftY * 0.25 + py * 0.25,
      _curveTarget.z,
    );
    camera.lookAt(_curveTarget);
  });

  return null;
}
