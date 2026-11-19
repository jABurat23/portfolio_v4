function hash2D(ix: number, iy: number): number {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function valueNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const u = smoothstep(fx);
  const v = smoothstep(fy);

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

export function fbm2D(
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2.0,
  gain = 0.5,
): number {
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  let normalization = 0;

  for (let i = 0; i < octaves; i += 1) {
    total += valueNoise2D(x * frequency, y * frequency) * amplitude;
    normalization += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return normalization > 0 ? total / normalization : 0;
}
