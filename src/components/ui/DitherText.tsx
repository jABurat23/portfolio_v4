"use client";

import { useEffect, useRef, useState } from "react";
import { type BayerMatrixSize, ditherConfig } from "@/config/dither";
import { introConfig } from "@/config/intro";
import { bayerThreshold } from "@/lib/bayer";

export type DitherTextMode = "reveal" | "dissolve" | "static";

export interface DitherTextProps {
  text: string;
  mode: DitherTextMode;
  progress: number;
  fontsReady: boolean;
  matrixSize?: BayerMatrixSize;
  pixelSize?: number;
  backgroundColor?: string;
  inkColor?: string;
  haloRadiusCells?: number;
  startSpeckleDensity?: number;
  maxSpeckleDensity?: number;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface GridCache {
  cols: number;
  rows: number;
  mask: Float32Array;
  noise: Float32Array;
  bayer: Float32Array;
  distance: Float32Array;
  imageData: ImageData;
}

function parseHexRgb(hex: string): RgbColor {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function cellNoise(x: number, y: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeDistanceField(
  mask: Float32Array,
  cols: number,
  rows: number,
  maxRadius: number,
): Float32Array {
  const total = cols * rows;
  const dist = new Float32Array(total);
  const inf = maxRadius + 1;
  dist.fill(inf);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const idx = y * cols + x;
      if (mask[idx] >= 0.35) {
        dist[idx] = 0;
        continue;
      }
      if (x > 0) dist[idx] = Math.min(dist[idx], dist[idx - 1] + 1);
      if (y > 0) {
        const up = idx - cols;
        dist[idx] = Math.min(dist[idx], dist[up] + 1);
        if (x > 0) dist[idx] = Math.min(dist[idx], dist[up - 1] + 1.414);
        if (x + 1 < cols) dist[idx] = Math.min(dist[idx], dist[up + 1] + 1.414);
      }
    }
  }

  for (let y = rows - 1; y >= 0; y -= 1) {
    for (let x = cols - 1; x >= 0; x -= 1) {
      const idx = y * cols + x;
      if (x + 1 < cols) dist[idx] = Math.min(dist[idx], dist[idx + 1] + 1);
      if (y + 1 < rows) {
        const down = idx + cols;
        dist[idx] = Math.min(dist[idx], dist[down] + 1);
        if (x > 0) dist[idx] = Math.min(dist[idx], dist[down - 1] + 1.414);
        if (x + 1 < cols) dist[idx] = Math.min(dist[idx], dist[down + 1] + 1.414);
      }
    }
  }

  return dist;
}

function buildGridCache(
  cols: number,
  rows: number,
  text: string,
  fontFamily: string,
  matrixSize: BayerMatrixSize,
  haloRadiusCells: number,
): GridCache {
  const total = cols * rows;
  const mask = new Float32Array(total);
  const noise = new Float32Array(total);
  const bayer = new Float32Array(total);

  const offscreen = document.createElement("canvas");
  offscreen.width = cols;
  offscreen.height = rows;
  const offCtx = offscreen.getContext("2d");

  if (offCtx) {
    offCtx.clearRect(0, 0, cols, rows);
    const probeSize = 64;
    offCtx.font = `700 ${probeSize}px ${fontFamily}`;
    const measuredWidth = Math.max(1, offCtx.measureText(text).width);
    const targetWidth = cols * 0.72;
    const targetHeight = rows * 0.45;
    const fittedSize = Math.max(
      10,
      Math.min((probeSize * targetWidth) / measuredWidth, targetHeight),
    );

    offCtx.font = `700 ${fittedSize}px ${fontFamily}`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillStyle = "#ffffff";
    offCtx.fillText(text, cols / 2, rows / 2);

    const textPixels = offCtx.getImageData(0, 0, cols, rows).data;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const idx = y * cols + x;
        mask[idx] = textPixels[idx * 4 + 3] / 255;
        noise[idx] = cellNoise(x, y);
        bayer[idx] = bayerThreshold(x, y, matrixSize);
      }
    }
  }

  const distance = computeDistanceField(mask, cols, rows, haloRadiusCells);

  return {
    cols,
    rows,
    mask,
    noise,
    bayer,
    distance,
    imageData: new ImageData(cols, rows),
  };
}

export default function DitherText({
  text,
  mode,
  progress,
  fontsReady,
  matrixSize = ditherConfig.matrixSize,
  pixelSize = ditherConfig.pixelSize,
  backgroundColor = ditherConfig.backgroundColor,
  inkColor = ditherConfig.inkColor,
  haloRadiusCells = introConfig.revealHaloRadiusCells,
  startSpeckleDensity = introConfig.startSpeckleDensity,
  maxSpeckleDensity = introConfig.maxSpeckleDensity,
}: DitherTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontProbeRef = useRef<HTMLSpanElement>(null);
  const gridCacheRef = useRef<GridCache | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setViewport({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = fontProbeRef.current;
    if (!canvas || !probe || viewport.width === 0 || viewport.height === 0) {
      return;
    }

    const cellPx = Math.max(2, pixelSize);
    const cols = Math.max(1, Math.ceil(viewport.width / cellPx));
    const rows = Math.max(1, Math.ceil(viewport.height / cellPx));
    const fontFamily = getComputedStyle(probe).fontFamily || "monospace";

    canvas.width = cols;
    canvas.height = rows;
    gridCacheRef.current = buildGridCache(
      cols,
      rows,
      text,
      fontFamily,
      matrixSize,
      haloRadiusCells,
    );
  }, [
    viewport.width,
    viewport.height,
    text,
    pixelSize,
    matrixSize,
    haloRadiusCells,
    fontsReady,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cache = gridCacheRef.current;
    if (!canvas || !cache) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = parseHexRgb(backgroundColor);
    const ink = parseHexRgb(inkColor);
    const { cols, rows, mask, noise, bayer, distance, imageData } = cache;
    const data = imageData.data;
    const p = clamp01(progress);

    if (mode === "static") {
      for (let i = 0; i < cols * rows; i += 1) {
        const isInk = mask[i] >= 0.45;
        const offset = i * 4;
        data[offset] = isInk ? ink.r : bg.r;
        data[offset + 1] = isInk ? ink.g : bg.g;
        data[offset + 2] = isInk ? ink.b : bg.b;
        data[offset + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      return;
    }

    if (mode === "reveal") {
      // Pure black frame at p=0; deterministic monotonic halo speckle grows calmly and condenses into crisp glyphs.
      const startDensity = clamp01(startSpeckleDensity);
      const peakDensity = Math.max(startDensity, clamp01(maxSpeckleDensity));
      const radius = Math.max(1, haloRadiusCells);

      const fadeInLead = clamp01(p / 0.04);
      const speckleRise = clamp01(p / 0.72);
      const haloDensity =
        fadeInLead *
        (startDensity + (peakDensity - startDensity) * (speckleRise * speckleRise));

      const glyphCurve = clamp01(p / 0.92);
      const glyphDensity =
        fadeInLead *
        (startDensity + (1 - startDensity) * Math.pow(glyphCurve, 1.55));

      const condense = clamp01((p - 0.72) / 0.26);
      const condenseEase = condense * condense * (3 - 2 * condense);

      for (let i = 0; i < cols * rows; i += 1) {
        const m = mask[i];
        const crisp = m >= 0.45;
        const dist = distance[i];
        let isInk = false;

        if (p >= 1) {
          isInk = crisp;
        } else if (crisp) {
          const rank = bayer[i] * 0.65 + noise[i] * 0.35;
          isInk = p >= 0.96 || glyphDensity >= rank;
        } else if (dist <= radius) {
          const proximity = 1 - dist / radius;
          const rank = bayer[i] * 0.55 + noise[i] * 0.45;
          const spatialThreshold = rank / (0.25 + 0.75 * proximity);
          const turnedOn = haloDensity >= spatialThreshold;
          const clearedByCondense =
            condenseEase > 0 &&
            (1 - proximity) * 0.7 + rank * 0.3 <= condenseEase;
          isInk = turnedOn && !clearedByCondense;
        }

        const offset = i * 4;
        data[offset] = isInk ? ink.r : bg.r;
        data[offset + 1] = isInk ? ink.g : bg.g;
        data[offset + 2] = isInk ? ink.b : bg.b;
        data[offset + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      return;
    }

    // Dissolve mode: fade screen cells to transparent in Bayer order.
    const easedDissolve = p * p * (3 - 2 * p);
    for (let i = 0; i < cols * rows; i += 1) {
      const dissolveThreshold = bayer[i] * 0.8 + noise[i] * 0.2;
      const visible = dissolveThreshold >= easedDissolve;
      const isInk = mask[i] >= 0.45;
      const offset = i * 4;

      data[offset] = isInk ? ink.r : bg.r;
      data[offset + 1] = isInk ? ink.g : bg.g;
      data[offset + 2] = isInk ? ink.b : bg.b;
      data[offset + 3] = visible ? 255 : 0;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [
    mode,
    progress,
    backgroundColor,
    inkColor,
    haloRadiusCells,
    startSpeckleDensity,
    maxSpeckleDensity,
    viewport.width,
    viewport.height,
    fontsReady,
    text,
    pixelSize,
    matrixSize,
  ]);

  return (
    <div ref={containerRef} className="relative h-full w-full select-none">
      <span
        ref={fontProbeRef}
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0 font-mono font-bold"
      >
        {text}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
