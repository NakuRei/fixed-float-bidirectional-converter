export type Float64Result = {
  readonly status: 'exact' | 'rounded';
  readonly value: string;
} | {
  readonly status: 'overflow';
};

export interface ConversionResults {
  readonly hex: ConversionValue;
  readonly binary: ConversionValue;
  readonly decimal: ConversionValue | { readonly status: 'overflow' };
}

export interface ConversionValue {
  readonly status: 'original' | 'exact' | 'rounded';
  readonly value: string;
}
