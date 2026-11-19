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

type ScrollToTopHandler = () => void;

let scrollToTopHandler: ScrollToTopHandler | null = null;

export function registerScrollToTop(handler: ScrollToTopHandler): () => void {
  scrollToTopHandler = handler;
  return () => {
    if (scrollToTopHandler === handler) {
      scrollToTopHandler = null;
    }
  };
}

export function scrollToTop(): void {
  if (scrollToTopHandler) {
    scrollToTopHandler();
    return;
  }
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}
