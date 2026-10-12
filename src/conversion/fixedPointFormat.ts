import type { ConversionOutcome } from './contracts';

export interface FixedPointFormat {
  readonly totalBits: number;
  readonly fractionalBits: number;
  readonly isSigned: boolean;
}

type FixedPointFormatReading = {
  status: 'valid';
  format: FixedPointFormat;
} | {
  status: 'unsafe-total-bits';
} | Extract<ConversionOutcome, { status: 'invalid' }>;

interface FixedPointFormatInput {
  integerBitsString: string;
  fractionalBitsString: string;
  isSigned: boolean;
}

function readBitCount(value: string): number | null {
  if (!(/^\d+$/u).test(value)) {
    return null;
  }
  const bits = Number(value);
  return Number.isSafeInteger(bits)
    ? bits
    : null;
}

export function readFixedPointFormat(
  input: FixedPointFormatInput,
): FixedPointFormatReading {
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
  if (totalBits === 0) {
    return {
      status: 'invalid',
      message: 'Total bit count must be at least 1.',
      invalidFields: ['integerBitsString', 'fractionalBitsString'],
    };
  }
  if (!Number.isSafeInteger(totalBits)) {
    return { status: 'unsafe-total-bits' };
  }
  return {
    status: 'valid',
    format: {
      totalBits,
      fractionalBits,
      isSigned: input.isSigned,
    },
  };
}
