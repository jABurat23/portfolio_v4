export type ScrollProgressListener = (progress: number) => void;

let currentProgress = 0;
let snapVersion = 0;
const listeners = new Set<ScrollProgressListener>();

export interface SetScrollProgressOptions {
  snap?: boolean;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function getScrollProgress(): number {
  return currentProgress;
}

export function getScrollSnapVersion(): number {
  return snapVersion;
}

export function setScrollProgress(
  value: number,
  options?: SetScrollProgressOptions,
): void {
  const next = clamp01(value);
  const changed = Math.abs(next - currentProgress) >= 1e-6;
  if (options?.snap) {
    snapVersion += 1;
  }
  if (!changed && !options?.snap) return;
  currentProgress = next;
  listeners.forEach((listener) => listener(currentProgress));
}

export function subscribeScrollProgress(
  listener: ScrollProgressListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

type ScrollToProgressHandler = (progress: number) => void;

let scrollToProgressHandler: ScrollToProgressHandler | null = null;

export function registerScrollToProgress(
  handler: ScrollToProgressHandler,
): () => void {
  scrollToProgressHandler = handler;
  return () => {
    if (scrollToProgressHandler === handler) {
      scrollToProgressHandler = null;
    }
  };
}

export function scrollToProgress(progress: number): void {
  const clamped = clamp01(progress);
  if (scrollToProgressHandler) {
    scrollToProgressHandler(clamped);
    return;
  }
  if (typeof window !== "undefined") {
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    window.scrollTo({ top: Math.round(clamped * maxScroll), behavior: "auto" });
  }
}

export function scrollToTop(): void {
  scrollToProgress(0);
}
