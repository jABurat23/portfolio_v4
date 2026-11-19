import type { BayerMatrixSize } from "@/config/dither";

function bayer2(x: number, y: number): number {
  const mx = ((x % 2) + 2) % 2;
  const my = ((y % 2) + 2) % 2;
  return 2 * ((mx + my) % 2) + my;
}

export function bayerThreshold(
  x: number,
  y: number,
  matrixSize: BayerMatrixSize,
): number {
  if (matrixSize === 8) {
    const v =
      16 * bayer2(x, y) +
      4 * bayer2(Math.floor(x / 2), Math.floor(y / 2)) +
      bayer2(Math.floor(x / 4), Math.floor(y / 4));
    return (v + 0.5) / 64;
  }

  const v = 4 * bayer2(x, y) + bayer2(Math.floor(x / 2), Math.floor(y / 2));
  return (v + 0.5) / 16;
}
