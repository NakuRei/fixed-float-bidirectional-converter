import { InputFormat, type InputFormatType } from '../constants/InputFormat';
import type { RoundingModeType } from '../constants/RoundingMode';
import type { ConversionResults } from '../types/ConversionResults';
import { encodeDecimalFixedPoint, MAX_DECIMAL_BITS } from './encodeDecimalFixedPoint';
import { decodeFixedPointFloat64 } from './decodeFixedPointFloat64';
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
  inputType: BitPatternFormat;
  roundingMode?: never;
}

interface DecimalInput extends ConversionFields {
  inputType: typeof InputFormat.Decimal;
  roundingMode: RoundingModeType;
}

export type ConversionInput = BitPatternInput | DecimalInput;

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

function toBinaryString(
  digits: string,
  inputType: BitPatternFormat,
  totalBits: number,
): string {
  if (inputType === InputFormat.Binary) {
    return digits;
  }
  return digits
    .split('')
    .map((character) => parseInt(character, 16).toString(2)
      .padStart(4, '0'))
    .join('')
    .slice(-totalBits);
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
    input.inputType,
    totalBits,
  );
  if (pattern.status === 'invalid') {
    return {
      status: 'invalid',
      message: pattern.message,
      invalidFields: ['inputString'],
    };
  }
  const binaryString = toBinaryString(
    pattern.digits,
    input.inputType,
    totalBits,
  );
  return {
    status: 'success',
    result: {
      hex: input.inputType === InputFormat.Hexadecimal
        ? {
          status: 'original',
          value: input.inputString,
        }
        : {
          status: 'exact',
          value: toHexString(binaryString, input.isSigned),
        },
      binary: input.inputType === InputFormat.Binary
        ? {
          status: 'original',
          value: input.inputString,
        }
        : {
          status: 'exact',
          value: binaryString,
        },
      decimal: decodeFixedPointFloat64(
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
  const status = encoding.inputWasRounded ? 'rounded' : 'exact';
  return {
    status: 'success',
    result: {
      hex: {
        status,
        value: toHexString(encoding.binaryString, input.isSigned),
      },
      binary: {
        status,
        value: encoding.binaryString,
      },
      decimal: {
        status: 'original',
        value: input.inputString,
      },
    },
  };
}

function validateTotalBitCount(
  totalBits: number,
  inputType: InputFormatType,
): string | null {
  if (totalBits === 0) {
    return 'Total bit count must be at least 1.';
  }
  if (inputType === InputFormat.Decimal && totalBits > MAX_DECIMAL_BITS) {
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
  const message = validateTotalBitCount(totalBits, input.inputType);
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
    trimmedInput.inputType,
  );
  if (foreignPrefixMessage !== null) {
    return {
      status: 'invalid',
      message: foreignPrefixMessage,
      invalidFields: ['inputString'],
    };
  }
  return trimmedInput.inputType === InputFormat.Decimal
    ? convertDecimalFixedPoint(trimmedInput, fractionalBits, totalBits)
    : convertFixedPointPattern(trimmedInput, fractionalBits, totalBits);
}
