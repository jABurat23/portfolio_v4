import { Vector2, Vector3 } from "three";

export const DitherShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new Vector2(1, 1) },
    uPixelStep: { value: 4 },
    uMatrixSize: { value: 4 },
    uThresholdBias: { value: 0 },
    uContrast: { value: 1 },
    uBackground: { value: new Vector3(10 / 255, 10 / 255, 10 / 255) },
    uInk: { value: new Vector3(242 / 255, 242 / 255, 242 / 255) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uPixelStep;
    uniform float uMatrixSize;
    uniform float uThresholdBias;
    uniform float uContrast;
    uniform vec3 uBackground;
    uniform vec3 uInk;

    varying vec2 vUv;

    float bayer2(vec2 p) {
      vec2 m = mod(floor(p), 2.0);
      return 2.0 * mod(m.x + m.y, 2.0) + m.y;
    }

    float bayerThreshold(vec2 cell, float matrixSize) {
      if (matrixSize > 6.0) {
        float v = 16.0 * bayer2(cell)
          + 4.0 * bayer2(floor(cell * 0.5))
          + bayer2(floor(cell * 0.25));
        return (v + 0.5) / 64.0;
      }
      float v = 4.0 * bayer2(cell) + bayer2(floor(cell * 0.5));
      return (v + 0.5) / 16.0;
    }

    void main() {
      float stepPx = max(uPixelStep, 1.0);
      vec2 cell = floor(gl_FragCoord.xy / stepPx);
      vec2 snappedUv = clamp((cell + 0.5) * stepPx / max(uResolution, vec2(1.0)), 0.0, 1.0);

      vec3 texel = texture2D(tDiffuse, snappedUv).rgb;
      vec3 gammaCorrected = sqrt(max(texel, vec3(0.0)));
      float luma = dot(gammaCorrected, vec3(0.2126, 0.7152, 0.0722));
      luma = clamp((luma - 0.5) * uContrast + 0.5 + uThresholdBias, 0.0, 1.0);

      float threshold = bayerThreshold(cell, uMatrixSize);
      vec3 color = mix(uBackground, uInk, step(threshold, luma));

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
