type Float64Result = {
  readonly status: 'exact' | 'rounded';
  readonly value: string;
} | {
  readonly status: 'overflow';
};

const FLOAT64_SIGNIFICAND_BITS = 53;
const FLOAT64_MAX_NORMAL_EXPONENT = 1023;
const FLOAT64_MIN_SUBNORMAL_EXPONENT = -1074;

function roundBinarySignificand(
  magnitude: bigint,
  discardedBits: number,
): {
  significand: bigint;
  wasRounded: boolean;
} {
  const shift = BigInt(discardedBits);
  const significand = magnitude >> shift;
  const remainder = magnitude - (significand << shift);
  const halfway = 1n << (shift - 1n);
  const roundUp = remainder > halfway
    || (remainder === halfway && significand % 2n === 1n);
  return {
    significand: roundUp ? significand + 1n : significand,
    wasRounded: remainder !== 0n,
  };
}

function roundMagnitudeToFloat64(
  magnitude: bigint,
  fractionalBits: number,
): {
  value: number;
  wasRounded: boolean;
} {
  if (magnitude === 0n) {
    return {
      value: 0,
      wasRounded: false,
    };
  }
  const leadingExponent = magnitude.toString(2).length - fractionalBits - 1;
  if (leadingExponent > FLOAT64_MAX_NORMAL_EXPONENT) {
    return {
      value: Infinity,
      wasRounded: true,
    };
  }
  if (leadingExponent < FLOAT64_MIN_SUBNORMAL_EXPONENT - 1) {
    return {
      value: 0,
      wasRounded: true,
    };
  }
  const roundingExponent = Math.max(
    leadingExponent - (FLOAT64_SIGNIFICAND_BITS - 1),
    FLOAT64_MIN_SUBNORMAL_EXPONENT,
  );
  const discardedBits = fractionalBits + roundingExponent;
  const rounded = discardedBits > 0
    ? roundBinarySignificand(magnitude, discardedBits)
    : {
      significand: magnitude,
      wasRounded: false,
    };
  const scaleExponent = Math.max(-fractionalBits, roundingExponent);
  return {
    value: Number(rounded.significand) * (2 ** scaleExponent),
    wasRounded: rounded.wasRounded,
  };
}

export function decodeFixedPointFloat64(
  binaryString: string,
  fractionalBits: number,
  isSigned: boolean,
): Float64Result {
  const unsignedInteger = BigInt(`0b${binaryString}`);
  const integer = isSigned && binaryString.startsWith('1')
    ? unsignedInteger - (1n << BigInt(binaryString.length))
    : unsignedInteger;
  const magnitude = integer < 0n ? -integer : integer;
  const rounded = roundMagnitudeToFloat64(magnitude, fractionalBits);
  if (!Number.isFinite(rounded.value)) {
    return { status: 'overflow' };
  }
  const value = integer < 0n ? -rounded.value : rounded.value;
  return {
    status: rounded.wasRounded ? 'rounded' : 'exact',
    value: value.toString(),
  };
}
