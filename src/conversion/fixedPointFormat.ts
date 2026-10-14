import type { ConversionOutcome } from './contracts';

export interface FixedPointFormat {
  readonly totalBits: number;
  readonly fractionalBits: number;
  readonly isSigned: boolean;
}

// The integer counts steps of 2^-fractionalBits, as the bit pattern stores it.
export function representsInteger(
  format: FixedPointFormat,
  integer: bigint,
): boolean {
  const magnitudeBits = format.isSigned
    ? format.totalBits - 1
    : format.totalBits;
  const maximum = (1n << BigInt(magnitudeBits)) - 1n;
  const minimum = format.isSigned ? -maximum - 1n : 0n;
  return integer >= minimum && integer <= maximum;
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
      diagnostic: {
        code: 'malformed-bit-count',
        fields: [
          ...integerBits === null ? ['integerBitsString' as const] : [],
          ...fractionalBits === null ? ['fractionalBitsString' as const] : [],
        ],
      },
    };
  }
  const totalBits = integerBits + fractionalBits;
  if (totalBits === 0) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'zero-total-bits',
        fields: ['integerBitsString', 'fractionalBitsString'],
      },
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
