import { InputFormat, type InputFormatType } from '../constants/InputFormat';
import type { ConversionResults } from '../types/ConversionResults';

const FLOAT64_SIGNIFICAND_BITS = 53;
const FLOAT64_MAX_NORMAL_EXPONENT = 1023;
const FLOAT64_MIN_SUBNORMAL_EXPONENT = -1074;

export interface ConversionInput {
  inputString: string;
  inputType: InputFormatType;
  isSigned: boolean;
  integerBitsString: string;
  fractionalBitsString: string;
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
  inputType: InputFormatType,
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
  inputType: InputFormatType,
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

function roundBinarySignificand(
  magnitude: bigint,
  discardedBits: number,
): bigint {
  const shift = BigInt(discardedBits);
  const significand = magnitude >> shift;
  const remainder = magnitude - (significand << shift);
  const halfway = 1n << (shift - 1n);
  const roundUp = remainder > halfway
    || (remainder === halfway && significand % 2n === 1n);
  return roundUp
    ? significand + 1n
    : significand;
}

function decodeFixedPointNumber(
  binaryString: string,
  fractionalBits: number,
  isSigned: boolean,
): number {
  const unsignedInteger = BigInt(`0b${binaryString}`);
  const integer = isSigned && binaryString.startsWith('1')
    ? unsignedInteger - (1n << BigInt(binaryString.length))
    : unsignedInteger;
  const isNegative = integer < 0n;
  const magnitude = isNegative
    ? -integer
    : integer;
  if (magnitude === 0n) {
    return 0;
  }
  const sign = isNegative
    ? -1
    : 1;
  const leadingExponent = magnitude.toString(2).length - fractionalBits - 1;
  if (leadingExponent > FLOAT64_MAX_NORMAL_EXPONENT) {
    return sign * Infinity;
  }
  if (leadingExponent < FLOAT64_MIN_SUBNORMAL_EXPONENT - 1) {
    return sign * 0;
  }
  const roundingExponent = Math.max(
    leadingExponent - (FLOAT64_SIGNIFICAND_BITS - 1),
    FLOAT64_MIN_SUBNORMAL_EXPONENT,
  );
  const discardedBits = fractionalBits + roundingExponent;
  const significand = discardedBits > 0
    ? roundBinarySignificand(magnitude, discardedBits)
    : magnitude;
  const scaleExponent = Math.max(-fractionalBits, roundingExponent);
  return sign * Number(significand) * (2 ** scaleExponent);
}

function convertBinaryFixedPoint(
  binaryString: string,
  fractionalBits: number,
  isSigned: boolean,
): ConversionOutcome {
  const floatValue = decodeFixedPointNumber(
    binaryString,
    fractionalBits,
    isSigned,
  );
  if (!Number.isFinite(floatValue)) {
    return {
      status: 'invalid',
      message: 'Value is outside the supported floating-point range.',
      invalidFields: ['inputString'],
    };
  }
  return {
    status: 'success',
    result: {
      binaryString,
      hexString: toHexString(binaryString, isSigned),
      floatString: floatValue.toString(),
    },
  };
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
  if (totalBits === 0 || !Number.isSafeInteger(totalBits)) {
    return {
      status: 'invalid',
      message: 'Total bit count must be positive and in the supported range.',
      invalidFields: ['integerBitsString', 'fractionalBitsString'],
    };
  }
  if (input.inputString === '') {
    return { status: 'empty' };
  }
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
  return convertBinaryFixedPoint(binaryString, fractionalBits, input.isSigned);
}
