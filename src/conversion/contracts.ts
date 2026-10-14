export const InputFormat = {
  Binary: 'binary',
  Decimal: 'decimal',
  Hexadecimal: 'hexadecimal',
} as const;

export type InputFormatType = (typeof InputFormat)[keyof typeof InputFormat];

export type BitPatternFormat
  = | typeof InputFormat.Binary
    | typeof InputFormat.Hexadecimal;

/*
 * Named after IEEE 754's rounding-direction attributes; ties-to-positive is
 * the one extra mode fixed-point toolchains offer as "nearest".
 */
export const RoundingMode = {
  TiesToEven: 'ties-to-even',
  TiesToAway: 'ties-to-away',
  TiesToPositive: 'ties-to-positive',
  TowardZero: 'toward-zero',
  TowardNegative: 'toward-negative',
  TowardPositive: 'toward-positive',
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

type BitCountField = 'integerBitsString' | 'fractionalBitsString';

type InputStringField = readonly ['inputString'];

// The fields name the inputs judged invalid, not every input that could fix it.
export type ConversionDiagnostic = {
  code: 'malformed-bit-count';
  fields: readonly BitCountField[];
} | {
  code: 'zero-total-bits';
  fields: readonly BitCountField[];
} | {
  code: 'total-bits-exceeded';
  inputFormat: InputFormatType;
  maximum: number;
  fields: readonly BitCountField[];
} | {
  code: 'foreign-prefix';
  prefixFormat: BitPatternFormat;
  fields: InputStringField;
} | {
  code: 'invalid-characters';
  inputFormat: BitPatternFormat;
  fields: InputStringField;
} | {
  code: 'digit-count-mismatch';
  inputFormat: BitPatternFormat;
  expected: number;
  actual: number;
  fields: InputStringField;
} | {
  code: 'malformed-decimal';
  fields: InputStringField;
} | {
  code: 'out-of-range';
  fields: InputStringField;
} | {
  code: 'inexact-value';
  fields: InputStringField;
};

export type ConversionOutcome = {
  status: 'empty';
} | {
  status: 'invalid';
  diagnostic: ConversionDiagnostic;
} | {
  status: 'success';
  result: ConversionResults;
};
