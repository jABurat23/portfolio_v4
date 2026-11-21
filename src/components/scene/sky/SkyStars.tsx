"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Vector2,
} from "three";
import { ditherConfig } from "@/config/dither";
import {
  getMaxDesktopStarCount,
  getSkyStarTargetCount,
  skyConfig,
} from "@/config/sky";
import { getScrollProgress } from "@/lib/scrollProgress";

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const SKY_STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aCellSpan;
  uniform vec2 uResolution;
  uniform float uPixelStep;

  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    if (clip.w <= 0.0) {
      gl_Position = clip;
      gl_PointSize = 0.0;
      return;
    }

    float stepPx = max(uPixelStep, 1.0);
    vec2 ndc = clip.xy / clip.w;
    vec2 screenPx = (ndc * 0.5 + 0.5) * uResolution;

    vec2 snappedPx = aCellSpan > 1.5
      ? floor(screenPx / stepPx + 0.5) * stepPx
      : (floor(screenPx / stepPx) + 0.5) * stepPx;

    vec2 snappedNdc = (snappedPx / max(uResolution, vec2(1.0))) * 2.0 - 1.0;
    clip.xy = snappedNdc * clip.w;

    gl_Position = clip;
    gl_PointSize = aCellSpan * stepPx;
  }
`;

const SKY_STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

const _drawingSize = new Vector2();

export interface SkyStarsProps {
  qualityMultiplierRef?: RefObject<number>;
}

export default function SkyStars({ qualityMultiplierRef }: SkyStarsProps) {
  const { gl, camera } = useThree();
  const pointsRef = useRef<Points>(null);
  const geometryRef = useRef<BufferGeometry | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const reducedMotionRef = useRef(false);
  const lastSizeRef = useRef({ width: 0, height: 0, dpr: 0 });
  const lastDrawCountRef = useRef(-1);

  const isNarrow = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth < skyConfig.narrowBreakpointPx,
    [],
  );

  const { geometry, material } = useMemo(() => {
    const rawMax = getMaxDesktopStarCount();
    const maxStars = isNarrow
      ? Math.max(0, Math.round(rawMax * skyConfig.narrowCountScale))
      : rawMax;
    const positions = new Float32Array(maxStars * 3);
    const cellSpans = new Float32Array(maxStars);

    const rand = createSeededRandom(skyConfig.seed);
    const minSin = Math.sin((skyConfig.minElevationDeg * Math.PI) / 180);
    const maxSin = Math.sin((skyConfig.maxElevationDeg * Math.PI) / 180);
    const sinSpan = maxSin - minSin;

    for (let i = 0; i < maxStars; i += 1) {
      const theta = rand() * Math.PI * 2;
      const sinPhi = minSin + rand() * sinSpan;
      const cosPhi = Math.sqrt(Math.max(0, 1 - sinPhi * sinPhi));

      positions[i * 3] = Math.cos(theta) * cosPhi * skyConfig.domeRadius;
      positions[i * 3 + 1] = sinPhi * skyConfig.domeRadius;
      positions[i * 3 + 2] = Math.sin(theta) * cosPhi * skyConfig.domeRadius;

      cellSpans[i] = rand() < skyConfig.twoCellRatio ? 2.0 : 1.0;
    }

    const initialCount = getSkyStarTargetCount(getScrollProgress(), isNarrow, 1);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aCellSpan", new BufferAttribute(cellSpans, 1));
    geo.setDrawRange(0, Math.min(maxStars, initialCount));
    geo.computeBoundingSphere();

    const mat = new ShaderMaterial({
      uniforms: {
        uResolution: { value: new Vector2(1, 1) },
        uPixelStep: { value: ditherConfig.pixelSize },
        uColor: { value: new Color(1, 1, 1) },
      },
      vertexShader: SKY_STAR_VERTEX_SHADER,
      fragmentShader: SKY_STAR_FRAGMENT_SHADER,
      depthTest: true,
      depthWrite: false,
      fog: false,
      transparent: false,
      toneMapped: false,
    });

    return { geometry: geo, material: mat };
  }, [isNarrow]);

  useEffect(() => {
    geometryRef.current = geometry;
    materialRef.current = material;
    lastDrawCountRef.current = -1;
    return () => {
      geometryRef.current = null;
      materialRef.current = null;
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches && pointsRef.current) {
        pointsRef.current.rotation.set(0, 0, 0);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const points = pointsRef.current;
    const geo = geometryRef.current;
    const mat = materialRef.current;
    if (!points || !geo || !mat) return;

    points.position.copy(camera.position);

    if (!reducedMotionRef.current) {
      const delta = Math.min(rawDelta, 0.1);
      points.rotation.y += skyConfig.driftRadiansPerSec * delta;
    }

    const tierMultiplier = qualityMultiplierRef?.current ?? 1;
    const targetCount = getSkyStarTargetCount(
      getScrollProgress(),
      isNarrow,
      tierMultiplier,
    );
    if (targetCount !== lastDrawCountRef.current) {
      geo.setDrawRange(0, targetCount);
      lastDrawCountRef.current = targetCount;
    }

    const dpr = gl.getPixelRatio();
    gl.getDrawingBufferSize(_drawingSize);
    const width = Math.max(1, _drawingSize.x);
    const height = Math.max(1, _drawingSize.y);
    const last = lastSizeRef.current;

    if (last.width !== width || last.height !== height || last.dpr !== dpr) {
      mat.uniforms.uResolution.value.set(width, height);
      mat.uniforms.uPixelStep.value = ditherConfig.pixelSize * dpr;
      lastSizeRef.current = { width, height, dpr };
    }
  });

  return (
    <points
      ref={pointsRef}
      args={[geometry, material]}
      renderOrder={-1}
      frustumCulled={false}
    />
  );
}
