import { RoundingMode, type RoundingModeType } from './RoundingMode';

export const MAX_DECIMAL_BITS = 16384;

interface DecimalValue {
  coefficient: bigint;
  exponent: bigint;
}

const rangeError = {
  status: 'invalid',
  message: 'Value is outside the selected fixed-point range.',
} as const;

const precisionError = {
  status: 'invalid',
  message: 'Value cannot be represented exactly with these fractional bits.',
} as const;

type DecimalEncoding = {
  status: 'success';
  binaryString: string;
  inputWasRounded: boolean;
} | {
  status: 'invalid';
  message: string;
};

interface RoundedDecimalInteger {
  integer: bigint;
  inputWasRounded: boolean;
}

type DecimalQuantization = {
  status: 'success';
} & RoundedDecimalInteger | typeof rangeError | typeof precisionError;

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

function roundDecimalRatio(
  numerator: bigint,
  denominator: bigint,
  roundingMode: RoundingModeType,
): RoundedDecimalInteger | null {
  const integer = numerator / denominator;
  const remainder = numerator % denominator;
  if (roundingMode === RoundingMode.Exact && remainder !== 0n) {
    return null;
  }
  if (roundingMode !== RoundingMode.NearestEven) {
    return {
      integer,
      inputWasRounded: remainder !== 0n,
    };
  }
  const distance = 2n * (remainder < 0n ? -remainder : remainder);
  const roundAway = distance > denominator
    || (distance === denominator && integer % 2n !== 0n);
  return {
    integer: roundAway ? integer + (numerator < 0n ? -1n : 1n) : integer,
    inputWasRounded: remainder !== 0n,
  };
}

function quantizeDecimalValue(
  value: DecimalValue,
  totalBits: number,
  fractionalBits: number,
  isSigned: boolean,
  roundingMode: RoundingModeType,
): DecimalQuantization {
  const magnitudeBits = isSigned ? totalBits - 1 : totalBits;
  const maximum = (1n << BigInt(magnitudeBits)) - 1n;
  const minimum = isSigned ? -maximum - 1n : 0n;
  if (value.exponent > BigInt(totalBits)) {
    return rangeError;
  }
  const magnitude = value.coefficient < 0n
    ? -value.coefficient
    : value.coefficient;
  // Beyond this exponent, the scaled magnitude is smaller than half a bit.
  const tinyExponent = -BigInt(magnitude.toString().length + fractionalBits);
  if (value.exponent < tinyExponent) {
    return roundingMode === RoundingMode.Exact
      ? precisionError
      : {
        status: 'success',
        integer: 0n,
        inputWasRounded: true,
      };
  }
  const { numerator, denominator } = scaleDecimalValue(value, fractionalBits);
  if (numerator < minimum * denominator
    || numerator > maximum * denominator) {
    return rangeError;
  }
  const rounded = roundDecimalRatio(numerator, denominator, roundingMode);
  return rounded === null
    ? precisionError
    : {
      status: 'success',
      ...rounded,
    };
}

export function encodeDecimalFixedPoint(
  inputString: string,
  totalBits: number,
  fractionalBits: number,
  isSigned: boolean,
  roundingMode: RoundingModeType,
): DecimalEncoding {
  const value = readDecimalValue(inputString);
  if (value === null) {
    return {
      status: 'invalid',
      message: 'Enter a valid decimal number.',
    };
  }
  if (value.coefficient === 0n) {
    return {
      status: 'success',
      binaryString: '0'.repeat(totalBits),
      inputWasRounded: false,
    };
  }
  if ((!isSigned && value.coefficient < 0n)
    || (isSigned && totalBits === 1 && value.coefficient > 0n)) {
    return rangeError;
  }
  const quantization = quantizeDecimalValue(
    value, totalBits, fractionalBits, isSigned, roundingMode,
  );
  if (quantization.status === 'invalid') {
    return quantization;
  }
  return {
    status: 'success',
    binaryString: BigInt.asUintN(totalBits, quantization.integer).toString(2)
      .padStart(totalBits, '0'),
    inputWasRounded: quantization.inputWasRounded,
  };
}
