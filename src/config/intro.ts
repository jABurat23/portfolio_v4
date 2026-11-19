export interface IntroConfig {
  title: string;
  promptText: string;
  skipLabel: string;
  reducedMotionButtonLabel: string;
  srDescription: string;
  sessionStorageKey: string;
  forceQueryParam: string;
  revealDurationMs: number;
  dissolveDurationMs: number;
}

export const introConfig: IntroConfig = {
  title: "AGUSTIN",
  promptText: "SCROLL TO ENTER",
  skipLabel: "SKIP",
  reducedMotionButtonLabel: "ENTER",
  srDescription: "AGUSTIN, portfolio. Scroll to enter.",
  sessionStorageKey: "agustin_intro_played",
  forceQueryParam: "intro",
  revealDurationMs: 3000,
  dissolveDurationMs: 1500,
};
