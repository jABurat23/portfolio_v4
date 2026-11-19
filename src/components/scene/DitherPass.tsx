"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import {
  Color,
  SRGBColorSpace,
  UnsignedByteType,
  Vector2,
  WebGLRenderTarget,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { type BayerMatrixSize, ditherConfig } from "@/config/dither";
import { DitherShader } from "./ditherShader";

export interface DitherPassProps {
  matrixSize?: BayerMatrixSize;
  pixelSize?: number;
  thresholdBias?: number;
  thresholdBiasRef?: RefObject<number>;
  contrast?: number;
  backgroundColor?: string;
  inkColor?: string;
}

const _tmpColor = new Color();
const _drawingSize = new Vector2();

function setColorUniform(target: { set: (x: number, y: number, z: number) => void }, hex: string) {
  _tmpColor.set(hex);
  const rgb = { r: 0, g: 0, b: 0 };
  _tmpColor.getRGB(rgb, SRGBColorSpace);
  target.set(rgb.r, rgb.g, rgb.b);
}

export default function DitherPass({
  matrixSize = ditherConfig.matrixSize,
  pixelSize = ditherConfig.pixelSize,
  thresholdBias = ditherConfig.thresholdBias,
  thresholdBiasRef,
  contrast = ditherConfig.contrast,
  backgroundColor = ditherConfig.backgroundColor,
  inkColor = ditherConfig.inkColor,
}: DitherPassProps) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const passRef = useRef<ShaderPass | null>(null);
  const lastBufferSizeRef = useRef({ width: 0, height: 0, dpr: 0 });

  useEffect(() => {
    gl.getDrawingBufferSize(_drawingSize);
    const initialWidth = Math.max(1, Math.floor(_drawingSize.x));
    const initialHeight = Math.max(1, Math.floor(_drawingSize.y));

    const renderTarget = new WebGLRenderTarget(initialWidth, initialHeight, {
      type: UnsignedByteType,
    });
    const composer = new EffectComposer(gl, renderTarget);
    const renderPass = new RenderPass(scene, camera);
    const ditherPass = new ShaderPass(DitherShader);
    ditherPass.material.toneMapped = false;

    composer.addPass(renderPass);
    composer.addPass(ditherPass);

    composerRef.current = composer;
    passRef.current = ditherPass;
    lastBufferSizeRef.current = { width: 0, height: 0, dpr: 0 };

    return () => {
      composerRef.current = null;
      passRef.current = null;
      renderPass.dispose();
      ditherPass.dispose();
      composer.dispose();
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    const composer = composerRef.current;
    const pass = passRef.current;
    if (!composer || !pass) return;

    const dpr = gl.getPixelRatio();
    composer.setPixelRatio(dpr);
    composer.setSize(Math.max(1, size.width), Math.max(1, size.height));

    gl.getDrawingBufferSize(_drawingSize);
    const bufW = Math.max(1, _drawingSize.x);
    const bufH = Math.max(1, _drawingSize.y);
    lastBufferSizeRef.current = { width: bufW, height: bufH, dpr };

    pass.uniforms.uResolution.value.set(bufW, bufH);
    pass.uniforms.uPixelStep.value = pixelSize * dpr;
    pass.uniforms.uMatrixSize.value = matrixSize;
    pass.uniforms.uThresholdBias.value = thresholdBias;
    pass.uniforms.uContrast.value = contrast;
    setColorUniform(pass.uniforms.uBackground.value, backgroundColor);
    setColorUniform(pass.uniforms.uInk.value, inkColor);
  }, [
    gl,
    size.width,
    size.height,
    matrixSize,
    pixelSize,
    thresholdBias,
    contrast,
    backgroundColor,
    inkColor,
  ]);

  // Render priority > 0 hands rendering control over to EffectComposer so R3F does not double-render.
  useFrame(() => {
    const composer = composerRef.current;
    const pass = passRef.current;
    if (!composer || !pass) return;

    const dpr = gl.getPixelRatio();
    gl.getDrawingBufferSize(_drawingSize);
    const bufW = Math.max(1, _drawingSize.x);
    const bufH = Math.max(1, _drawingSize.y);
    const last = lastBufferSizeRef.current;

    if (last.width !== bufW || last.height !== bufH || last.dpr !== dpr) {
      composer.setPixelRatio(dpr);
      composer.setSize(Math.max(1, size.width), Math.max(1, size.height));
      pass.uniforms.uResolution.value.set(bufW, bufH);
      pass.uniforms.uPixelStep.value = pixelSize * dpr;
      lastBufferSizeRef.current = { width: bufW, height: bufH, dpr };
    }

    pass.uniforms.uThresholdBias.value =
      thresholdBias + (thresholdBiasRef?.current ?? 0);

    composer.render();
  }, 1);

  return null;
}
