import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

export function createPlaceholderGradientTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width * 0.35, canvas.height);
    gradient.addColorStop(0, "#ededed");
    gradient.addColorStop(0.38, "#9c9c9c");
    gradient.addColorStop(0.75, "#3f3f3f");
    gradient.addColorStop(1, "#121212");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle inset hairline border inside the slot so the aperture edges read crisply.
    ctx.strokeStyle = "#b8b8b8";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
}
