export interface VoidFieldConfig {
  narrowBreakpointPx: number;
  dotCountDesktop: number;
  dotCountMobile: number;
  lineCountDesktop: number;
  lineCountMobile: number;
  pointsPerLine: number;
  dotSize: number;
  lineDotSize: number;
  lineLengthMin: number;
  lineLengthMax: number;
  boundsX: number;
  boundsYMin: number;
  boundsYMax: number;
  startZOffset: number;
  depthSpanZ: number;
  minIntensity: number;
  maxIntensity: number;
  driftSpeed: number;
  driftAmplitudeX: number;
  driftAmplitudeY: number;
  rotationSpeedY: number;
}

export interface VoidPanelsTimingConfig {
  aboutFadeInStart: number;
  aboutFadeInEnd: number;
  aboutHoldEnd: number;
  aboutFadeOutEnd: number;
  contactFadeInStart: number;
  contactFadeInEnd: number;
  backButtonFadeInStart: number;
  backButtonFadeInEnd: number;
  activeThreshold: number;
}

export interface VoidConfig {
  scrollVh: number;
  field: VoidFieldConfig;
  panels: VoidPanelsTimingConfig;
}

export const voidConfig: VoidConfig = {
  scrollVh: 220,
  field: {
    narrowBreakpointPx: 768,
    dotCountDesktop: 160,
    dotCountMobile: 85,
    lineCountDesktop: 20,
    lineCountMobile: 11,
    pointsPerLine: 11,
    dotSize: 0.17,
    lineDotSize: 0.15,
    lineLengthMin: 4.5,
    lineLengthMax: 9.5,
    boundsX: 22,
    boundsYMin: 3.5,
    boundsYMax: 24,
    startZOffset: 2,
    depthSpanZ: 92,
    minIntensity: 0.55,
    maxIntensity: 0.96,
    driftSpeed: 0.16,
    driftAmplitudeX: 0.6,
    driftAmplitudeY: 0.45,
    rotationSpeedY: 0.014,
  },
  panels: {
    aboutFadeInStart: 0.06,
    aboutFadeInEnd: 0.12,
    aboutHoldEnd: 0.44,
    aboutFadeOutEnd: 0.5,
    contactFadeInStart: 0.52,
    contactFadeInEnd: 0.58,
    backButtonFadeInStart: 0.64,
    backButtonFadeInEnd: 0.7,
    activeThreshold: 0.5,
  },
};
