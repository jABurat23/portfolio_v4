export interface IntroConfig {
  title: string;
  promptText: string;
  reducedMotionButtonLabel: string;
  srDescription: string;
  sessionStorageKey: string;
  forceQueryParam: string;
  revealDurationMs: number;
  revealHaloRadiusCells: number;
  startSpeckleDensity: number;
  maxSpeckleDensity: number;
  dissolveDurationMs: number;
}

export const introConfig: IntroConfig = {
  title: "AGUSTIN",
  promptText: "SCROLL TO ENTER",
  reducedMotionButtonLabel: "ENTER",
  srDescription: "AGUSTIN, portfolio. Scroll to enter.",
  sessionStorageKey: "agustin_intro_played",
  forceQueryParam: "intro",
  revealDurationMs: 4000,
  revealHaloRadiusCells: 14,
  startSpeckleDensity: 0.03,
  maxSpeckleDensity: 0.42,
  dissolveDurationMs: 1500,
};
