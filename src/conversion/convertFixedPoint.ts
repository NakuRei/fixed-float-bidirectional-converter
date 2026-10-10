import { InputFormat, type InputFormatType } from './InputFormat';
import type { RoundingModeType } from './RoundingMode';
import { encodeDecimalFixedPoint, MAX_DECIMAL_BITS } from './encodeDecimalFixedPoint';
import {
  decodeFixedPointFloat64,
  type Float64Result,
} from './decodeFixedPointFloat64';
import {
  findForeignPrefixMessage,
  parseBitPattern,
  type BitPatternFormat,
} from './parseInputNotation';

interface ConversionFields {
  inputString: string;
  isSigned: boolean;
  integerBitsString: string;
  fractionalBitsString: string;
}

interface BitPatternInput extends ConversionFields {
  inputFormat: BitPatternFormat;
  roundingMode?: never;
}

interface DecimalInput extends ConversionFields {
  inputFormat: typeof InputFormat.Decimal;
  roundingMode: RoundingModeType;
}

export type ConversionInput = BitPatternInput | DecimalInput;

interface FixedPointValue {
  readonly status: 'exact' | 'rounded';
  readonly hexadecimal: string;
  readonly binary: string;
}

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

function readBitCount(value: string): number | null {
  if (!(/^\d+$/u).test(value)) {
    return null;
  }
  const bits = Number(value);
  return Number.isSafeInteger(bits)
    ? bits
    : null;
}

function toHexString(binaryString: string, isSigned: boolean): string {
  const paddingBit = isSigned && binaryString.startsWith('1') ? '1' : '0';
  let hexString = '';
  for (let end = binaryString.length; end > 0; end -= 4) {
    const segment = binaryString.slice(Math.max(end - 4, 0), end)
      .padStart(4, paddingBit);
    hexString = parseInt(segment, 2).toString(16) + hexString;
  }
  return hexString.toUpperCase();
}

function convertFixedPointPattern(
  input: BitPatternInput,
  fractionalBits: number,
  totalBits: number,
): ConversionOutcome {
  const pattern = parseBitPattern(
    input.inputString,
    input.inputFormat,
    totalBits,
  );
  if (pattern.status === 'invalid') {
    return {
      status: 'invalid',
      message: pattern.message,
      invalidFields: ['inputString'],
    };
  }
  const { binaryString } = pattern;
  return {
    status: 'success',
    result: {
      inputFormat: input.inputFormat,
      inputString: input.inputString,
      fixedPoint: {
        status: 'exact',
        hexadecimal: toHexString(binaryString, input.isSigned),
        binary: binaryString,
      },
      float64: decodeFixedPointFloat64(
        binaryString, fractionalBits, input.isSigned,
      ),
    },
  };
}

function convertDecimalFixedPoint(
  input: DecimalInput,
  fractionalBits: number,
  totalBits: number,
): ConversionOutcome {
  const encoding = encodeDecimalFixedPoint(
    input.inputString,
    totalBits,
    fractionalBits,
    input.isSigned,
    input.roundingMode,
  );
  if (encoding.status === 'invalid') {
    return {
      ...encoding,
      invalidFields: ['inputString'],
    };
  }
  return {
    status: 'success',
    result: {
      inputFormat: input.inputFormat,
      inputString: input.inputString,
      fixedPoint: {
        status: encoding.inputWasRounded ? 'rounded' : 'exact',
        hexadecimal: toHexString(encoding.binaryString, input.isSigned),
        binary: encoding.binaryString,
      },
    },
  };
}

function validateTotalBitCount(
  totalBits: number,
  inputFormat: InputFormatType,
): string | null {
  if (totalBits === 0) {
    return 'Total bit count must be at least 1.';
  }
  if (inputFormat === InputFormat.Decimal && totalBits > MAX_DECIMAL_BITS) {
    return 'Decimal conversion supports at most '
      + `${MAX_DECIMAL_BITS.toString()} total bits.`;
  }
  if (!Number.isSafeInteger(totalBits)) {
    return 'Total bit count is too large.';
  }
  return null;
}

export function convertFixedPoint(input: ConversionInput): ConversionOutcome {
  const integerBits = readBitCount(input.integerBitsString);
  const fractionalBits = readBitCount(input.fractionalBitsString);
  if (integerBits === null || fractionalBits === null) {
    return {
      status: 'invalid',
      message: 'Bit counts must be non-negative whole numbers.',
      invalidFields: [
        ...integerBits === null ? ['integerBitsString' as const] : [],
        ...fractionalBits === null ? ['fractionalBitsString' as const] : [],
      ],
    };
  }
  const totalBits = integerBits + fractionalBits;
  const message = validateTotalBitCount(totalBits, input.inputFormat);
  if (message !== null) {
    return {
      status: 'invalid',
      message,
      invalidFields: ['integerBitsString', 'fractionalBitsString'],
    };
  }
  // Pasted values often carry surrounding whitespace or line breaks.
  const trimmedInput = {
    ...input,
    inputString: input.inputString.trim(),
  };
  if (trimmedInput.inputString === '') {
    return { status: 'empty' };
  }
  const foreignPrefixMessage = findForeignPrefixMessage(
    trimmedInput.inputString,
    trimmedInput.inputFormat,
  );
  if (foreignPrefixMessage !== null) {
    return {
      status: 'invalid',
      message: foreignPrefixMessage,
      invalidFields: ['inputString'],
    };
  }
  return trimmedInput.inputFormat === InputFormat.Decimal
    ? convertDecimalFixedPoint(trimmedInput, fractionalBits, totalBits)
    : convertFixedPointPattern(trimmedInput, fractionalBits, totalBits);
}
