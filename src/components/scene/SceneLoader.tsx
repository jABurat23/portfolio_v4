"use client";

import dynamic from "next/dynamic";
import type { SceneCanvasProps } from "./SceneCanvas";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
});

export default function SceneLoader(props: SceneCanvasProps) {
  return <SceneCanvas {...props} />;
}
