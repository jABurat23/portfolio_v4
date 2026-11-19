"use client";

import { useEffect, useRef, useState } from "react";
import { type BayerMatrixSize, ditherConfig } from "@/config/dither";
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

function buildGridCache(
  cols: number,
  rows: number,
  text: string,
  fontFamily: string,
  matrixSize: BayerMatrixSize,
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

  return {
    cols,
    rows,
    mask,
    noise,
    bayer,
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
    gridCacheRef.current = buildGridCache(cols, rows, text, fontFamily, matrixSize);
  }, [viewport.width, viewport.height, text, pixelSize, matrixSize, fontsReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cache = gridCacheRef.current;
    if (!canvas || !cache) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = parseHexRgb(backgroundColor);
    const ink = parseHexRgb(inkColor);
    const { cols, rows, mask, noise, bayer, imageData } = cache;
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
      // Gradual pacing over the full duration: pure black -> Bayer noise -> crisp text.
      const ambientEnvelope =
        p < 0.86 ? Math.sin((p / 0.86) * Math.PI) * 0.44 : 0;
      const glyphP = clamp01((p - 0.14) / 0.86);
      const glyphEase = glyphP * glyphP * (3 - 2 * glyphP);
      const settleP = clamp01((p - 0.84) / 0.16);

      for (let i = 0; i < cols * rows; i += 1) {
        const m = mask[i];
        const n = noise[i];
        const threshold = bayer[i];

        let isInk = false;
        if (settleP >= 1) {
          isInk = m >= 0.45;
        } else {
          const bgSignal = ambientEnvelope * n;
          const glyphNoise = (1 - glyphEase) * 0.25 * n;
          const glyphSignal = m * (glyphEase * 1.12) + (m > 0.05 ? glyphNoise * Math.min(1, p * 4) : 0);
          const luma = Math.max(bgSignal, glyphSignal);
          const dithered = luma > 0 && luma >= threshold;
          const crisp = m >= 0.45;
          isInk = settleP > 0 ? (settleP > n ? crisp : dithered) : dithered;
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
