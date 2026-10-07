export const RoundingMode = {
  NearestEven: 'nearest-even',
  TowardZero: 'toward-zero',
  Exact: 'exact',
} as const;

export type RoundingModeType = (typeof RoundingMode)[keyof typeof RoundingMode];
