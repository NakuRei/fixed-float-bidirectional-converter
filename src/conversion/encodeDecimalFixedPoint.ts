import {
  RoundingMode,
  type ConversionDiagnostic,
  type RoundingModeType,
} from './contracts';
import type { FixedPointFormat } from './fixedPointFormat';

export const MAX_DECIMAL_BITS = 16384;

interface DecimalValue {
  coefficient: bigint;
  exponent: bigint;
}

const rangeError = {
  status: 'invalid',
  diagnostic: {
    code: 'out-of-range',
    fields: ['inputString'],
  },
} as const;

const precisionError = {
  status: 'invalid',
  diagnostic: {
    code: 'inexact-value',
    fields: ['inputString'],
  },
} as const;

interface RoundedDecimalInteger {
  integer: bigint;
  inputWasRounded: boolean;
}

type DecimalEncoding = {
  status: 'success';
} & RoundedDecimalInteger | {
  status: 'invalid';
  diagnostic: Extract<ConversionDiagnostic, {
    code: 'malformed-decimal' | 'out-of-range' | 'inexact-value';
  }>;
};

type RoundedQuantization = {
  status: 'success';
} & RoundedDecimalInteger | typeof precisionError;

type DecimalQuantization = RoundedQuantization | typeof rangeError;

function readDecimalValue(inputString: string): DecimalValue | null {
  const decimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/u;
  if (!decimalPattern.test(inputString)) {
    return null;
  }
  const [mantissa, exponent = '0'] = inputString.split(/[eE]/u);
  const pointIndex = mantissa.indexOf('.');
  const fractionalDigits = pointIndex === -1
    ? 0
    : mantissa.length - pointIndex - 1;
  return {
    coefficient: BigInt(mantissa.replace('.', '')),
    exponent: BigInt(exponent) - BigInt(fractionalDigits),
  };
}

function scaleDecimalValue(
  value: DecimalValue,
  fractionalBits: number,
): {
  numerator: bigint;
  denominator: bigint;
} {
  const numerator = value.coefficient << BigInt(fractionalBits);
  if (value.exponent >= 0n) {
    return {
      numerator: numerator * (10n ** value.exponent),
      denominator: 1n,
    };
  }
  return {
    numerator,
    denominator: 10n ** -value.exponent,
  };
}

type InexactRoundingMode = Exclude<
  RoundingModeType,
  typeof RoundingMode.Exact
>;

/*
 * The value lies strictly between lower and lower + 1, so lower is negative
 * exactly when the value is.
 */
interface InexactQuotient {
  lower: bigint;
  fraction: 'below-half' | 'half' | 'above-half';
}

type FloorQuotient = {
  lower: bigint;
  fraction: 'zero';
} | InexactQuotient;

const selectNeighbor: Record<
  InexactRoundingMode,
  (quotient: InexactQuotient) => 'lower' | 'upper'
> = {
  [RoundingMode.NearestEven]: ({ lower, fraction }) => {
    if (fraction === 'half') {
      return lower % 2n === 0n ? 'lower' : 'upper';
    }
    return fraction === 'below-half' ? 'lower' : 'upper';
  },
  [RoundingMode.TowardZero]: ({ lower }) => {
    return lower < 0n ? 'upper' : 'lower';
  },
};

function divideFloor(numerator: bigint, denominator: bigint): FloorQuotient {
  // BigInt division truncates toward zero; shift negative quotients down.
  const truncated = numerator / denominator;
  const truncatedRemainder = numerator % denominator;
  const lower = truncatedRemainder < 0n ? truncated - 1n : truncated;
  const remainder = truncatedRemainder < 0n
    ? truncatedRemainder + denominator
    : truncatedRemainder;
  if (remainder === 0n) {
    return {
      lower,
      fraction: 'zero',
    };
  }
  const doubledRemainder = 2n * remainder;
  if (doubledRemainder < denominator) {
    return {
      lower,
      fraction: 'below-half',
    };
  }
  return {
    lower,
    fraction: doubledRemainder === denominator ? 'half' : 'above-half',
  };
}

function roundFloorQuotient(
  quotient: FloorQuotient,
  roundingMode: RoundingModeType,
): RoundedQuantization {
  if (quotient.fraction === 'zero') {
    return {
      status: 'success',
      integer: quotient.lower,
      inputWasRounded: false,
    };
  }
  if (roundingMode === RoundingMode.Exact) {
    return precisionError;
  }
  const neighbor = selectNeighbor[roundingMode](quotient);
  return {
    status: 'success',
    integer: neighbor === 'upper' ? quotient.lower + 1n : quotient.lower,
    inputWasRounded: true,
  };
}

function quantizeDecimalValue(
  value: DecimalValue,
  format: FixedPointFormat,
  roundingMode: RoundingModeType,
): DecimalQuantization {
  const { totalBits, fractionalBits, isSigned } = format;
  const magnitudeBits = isSigned ? totalBits - 1 : totalBits;
  const maximum = (1n << BigInt(magnitudeBits)) - 1n;
  const minimum = isSigned ? -maximum - 1n : 0n;
  if (value.exponent > BigInt(totalBits)) {
    return rangeError;
  }
  const magnitude = value.coefficient < 0n
    ? -value.coefficient
    : value.coefficient;

  /*
   * Beyond this exponent, the scaled value lies within half a bit of zero, so
   * its quotient is known without building the large denominator.
   */
  const tinyExponent = -BigInt(magnitude.toString().length + fractionalBits);
  if (value.exponent < tinyExponent) {
    return roundFloorQuotient(
      value.coefficient < 0n
        ? {
          lower: -1n,
          fraction: 'above-half',
        }
        : {
          lower: 0n,
          fraction: 'below-half',
        },
      roundingMode,
    );
  }
  const { numerator, denominator } = scaleDecimalValue(value, fractionalBits);
  if (numerator < minimum * denominator
    || numerator > maximum * denominator) {
    return rangeError;
  }
  return roundFloorQuotient(
    divideFloor(numerator, denominator),
    roundingMode,
  );
}

export function encodeDecimalFixedPoint(
  inputString: string,
  format: FixedPointFormat,
  roundingMode: RoundingModeType,
): DecimalEncoding {
  const { totalBits, isSigned } = format;
  const value = readDecimalValue(inputString);
  if (value === null) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'malformed-decimal',
        fields: ['inputString'],
      },
    };
  }
  if (value.coefficient === 0n) {
    return {
      status: 'success',
      integer: 0n,
      inputWasRounded: false,
    };
  }
  if ((!isSigned && value.coefficient < 0n)
    || (isSigned && totalBits === 1 && value.coefficient > 0n)) {
    return rangeError;
  }
  return quantizeDecimalValue(value, format, roundingMode);
}
