export const InputFormat = {
  Binary: 'binary',
  Decimal: 'decimal',
  Hexadecimal: 'hexadecimal',
} as const;

export type InputFormatType = (typeof InputFormat)[keyof typeof InputFormat];

export type BitPatternFormat
  = | typeof InputFormat.Binary
    | typeof InputFormat.Hexadecimal;

export const RoundingMode = {
  NearestEven: 'nearest-even',
  TowardZero: 'toward-zero',
  Exact: 'exact',
} as const;

export type RoundingModeType = (typeof RoundingMode)[keyof typeof RoundingMode];

interface ConversionFields {
  inputString: string;
  // Signed values interpret the full bit pattern as two's complement.
  isSigned: boolean;
  // The two bit counts sum to the total width, including any sign bit.
  integerBitsString: string;
  fractionalBitsString: string;
}

interface BitPatternInput extends ConversionFields {
  inputFormat: BitPatternFormat;
  roundingMode?: never;
}

interface DecimalInput extends ConversionFields {
  inputFormat: typeof InputFormat.Decimal;
  // Applies to decimal quantization, independently of Float64 rounding.
  roundingMode: RoundingModeType;
}

export type ConversionInput = BitPatternInput | DecimalInput;

interface FixedPointValue {
  readonly status: 'exact' | 'rounded';
  readonly hexadecimal: string;
  readonly binary: string;
}

// Float64 uses nearest rounding with ties to even; underflow can round to zero.
export type Float64Result = {
  readonly status: 'exact' | 'rounded';
  readonly value: string;
} | {
  readonly status: 'overflow';
};

export type ConversionResults = {
  readonly inputFormat: typeof InputFormat.Decimal;
  readonly inputString: string;
  readonly fixedPoint: FixedPointValue;
} | {
  readonly inputFormat: BitPatternFormat;
  readonly inputString: string;
  readonly fixedPoint: FixedPointValue;
  readonly float64: Float64Result;
};

export type ConversionOutcome = {
  status: 'empty';
} | {
  status: 'invalid';
  message: string;
  invalidFields: (keyof ConversionInput)[];
} | {
  status: 'success';
  result: ConversionResults;
};
