import { InputFormat, type InputFormatType } from '../constants/InputFormat';
import type { RoundingModeType } from '../constants/RoundingMode';
import type { ConversionResults } from '../types/ConversionResults';
import { encodeDecimalFixedPoint, MAX_DECIMAL_BITS } from './encodeDecimalFixedPoint';
import { decodeFixedPointFloat64 } from './decodeFixedPointFloat64';

interface ConversionFields {
  inputString: string;
  isSigned: boolean;
  integerBitsString: string;
  fractionalBitsString: string;
}

type BitPatternFormat = typeof InputFormat.Binary
  | typeof InputFormat.Hexadecimal;

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
  inputWasRounded: boolean;
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

function validateFixedPointString(
  inputString: string,
  inputType: BitPatternFormat,
  totalBits: number,
): string | null {
  const isBinary = inputType === InputFormat.Binary;
  const allowedCharacters = isBinary
    ? /^[01]+$/u
    : /^[0-9A-Fa-f]+$/u;
  if (!allowedCharacters.test(inputString)) {
    return isBinary
      ? 'Binary string contains characters other than 0 and 1'
      : 'Hex string contains characters other than 0-9 and A-F';
  }
  const expectedLength = isBinary
    ? totalBits
    : Math.ceil(totalBits / 4);
  if (inputString.length !== expectedLength) {
    const inputName = isBinary
      ? 'Binary'
      : 'Hex';
    return `${inputName} string length should be ${expectedLength.toString()}, `
      + `but got ${inputString.length.toString()}`;
  }
  return null;
}

function toBinaryString(
  inputString: string,
  inputType: BitPatternFormat,
  totalBits: number,
): string {
  if (inputType === InputFormat.Binary) {
    return inputString;
  }
  return inputString
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

function formatFixedPointResults(
  binaryString: string,
  fractionalBits: number,
  isSigned: boolean,
): ConversionResults {
  return {
    binaryString,
    hexString: toHexString(binaryString, isSigned),
    float64: decodeFixedPointFloat64(binaryString, fractionalBits, isSigned),
  };
}

function convertFixedPointPattern(
  input: BitPatternInput,
  fractionalBits: number,
  totalBits: number,
): ConversionOutcome {
  const message = validateFixedPointString(
    input.inputString,
    input.inputType,
    totalBits,
  );
  if (message !== null) {
    return {
      status: 'invalid',
      message,
      invalidFields: ['inputString'],
    };
  }
  const binaryString = toBinaryString(
    input.inputString,
    input.inputType,
    totalBits,
  );
  return {
    status: 'success',
    inputWasRounded: false,
    result: formatFixedPointResults(
      binaryString, fractionalBits, input.isSigned,
    ),
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
    inputWasRounded: encoding.inputWasRounded,
    result: formatFixedPointResults(
      encoding.binaryString, fractionalBits, input.isSigned,
    ),
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
  if (input.inputString === '') {
    return { status: 'empty' };
  }
  return input.inputType === InputFormat.Decimal
    ? convertDecimalFixedPoint(input, fractionalBits, totalBits)
    : convertFixedPointPattern(input, fractionalBits, totalBits);
}
