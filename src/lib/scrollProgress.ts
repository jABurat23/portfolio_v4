export type ScrollProgressListener = (progress: number) => void;

let currentProgress = 0;
const listeners = new Set<ScrollProgressListener>();

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function getScrollProgress(): number {
  return currentProgress;
}

export function setScrollProgress(value: number): void {
  const next = clamp01(value);
  if (Math.abs(next - currentProgress) < 1e-6) return;
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
