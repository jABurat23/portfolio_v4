export type BayerMatrixSize = 4 | 8;

export interface DitherConfig {
  matrixSize: BayerMatrixSize;
  pixelSize: number;
  thresholdBias: number;
  contrast: number;
  maxDpr: number;
  backgroundColor: string;
  inkColor: string;
}

export const ditherConfig: DitherConfig = {
  matrixSize: 4,
  pixelSize: 4,
  thresholdBias: 0,
  contrast: 1.15,
  maxDpr: 1.5,
  backgroundColor: "#0A0A0A",
  inkColor: "#F2F2F2",
};
