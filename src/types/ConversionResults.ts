export type Float64Result = {
  readonly status: 'exact' | 'rounded';
  readonly value: string;
} | {
  readonly status: 'overflow';
};

export interface ConversionResults {
  readonly hexString: string;
  readonly binaryString: string;
  readonly float64: Float64Result;
}
