export const FALLBACK_QUERY_PARAM = "fallback";

export function isFallbackForced(search?: string): boolean {
  if (typeof window === "undefined" && search === undefined) return false;
  const query = search ?? window.location.search;
  return new URLSearchParams(query).get(FALLBACK_QUERY_PARAM) === "1";
}

export function detectWebGLSupport(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    if (!gl) return false;

    const webgl = gl as WebGLRenderingContext | WebGL2RenderingContext;
    webgl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
