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

/*
 * The notation the value was entered in keeps the trimmed input text,
 * including any prefix, letter case, exponent and trailing zeros.
 */
interface OriginalNotationResult {
  readonly status: 'original';
  readonly value: string;
}

/*
 * Rounding here comes from quantizing a decimal input to the fixed-point
 * format.
 */
interface FixedPointNotationResult {
  readonly status: 'exact' | 'rounded';
  readonly value: string;
}

/*
 * The status reports whether the fixed-point value converts to Float64 exactly,
 * not whether the shortest decimal text equals it. Float64 uses nearest
 * rounding with ties to even; underflow can round to zero.
 */
export type Float64Result = {
  readonly status: 'exact' | 'rounded';
  readonly value: string;
} | {
  readonly status: 'overflow';
};

export interface ConversionResults {
  readonly hexadecimal: OriginalNotationResult | FixedPointNotationResult;
  readonly binary: OriginalNotationResult | FixedPointNotationResult;
  readonly decimal: OriginalNotationResult | Float64Result;
}

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
