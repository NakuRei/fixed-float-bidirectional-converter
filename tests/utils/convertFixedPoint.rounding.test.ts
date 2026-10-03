import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/constants/InputFormat';
import { convertFixedPoint } from '../../src/utils/convertFixedPoint';

function expectFloatConversion(
  integer: bigint,
  totalBits: number,
  fractionalBits: number,
  isSigned: boolean,
  expectedValue: number,
): void {
  const unsignedInteger = integer < 0n
    ? integer + (2n ** BigInt(totalBits))
    : integer;
  const binaryString = unsignedInteger.toString(2).padStart(totalBits, '0');
  for (const inputType of [InputFormat.Binary, InputFormat.Hexadecimal]) {
    const inputString = inputType === InputFormat.Binary
      ? binaryString
      : unsignedInteger.toString(16).padStart(Math.ceil(totalBits / 4), '0');
    const outcome = convertFixedPoint({
      inputString,
      inputType,
      isSigned,
      integerBitsString: (totalBits - fractionalBits).toString(),
      fractionalBitsString: fractionalBits.toString(),
    });
    if (Number.isFinite(expectedValue)) {
      expect(outcome).toMatchObject({
        status: 'success',
        result: {
          binaryString,
          floatString: expectedValue.toString(),
        },
      });
    } else {
      expect(outcome).toMatchObject({
        status: 'invalid',
        invalidFields: ['inputString'],
      });
      if (outcome.status === 'invalid') {
        expect(outcome.message).toMatch(/floating-point range/iu);
      }
    }
  }
}

describe('convertFixedPoint binary64 rounding', () => {
  it.each([
    {
      name: 'zero with 1025 integer bits',
      integer: 0n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: 0,
    },
    {
      name: 'one with 1025 integer bits',
      integer: 1n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: 1,
    },
    {
      name: 'one with a wide integer and fraction',
      integer: 1n << 1500n,
      totalBits: 1502,
      fractionalBits: 1500,
      expectedValue: 1,
    },
    {
      name: 'an integer above a rounding midpoint',
      integer: (1n << 54n) + 3n,
      totalBits: 56,
      fractionalBits: 0,
      expectedValue: 18014398509481988,
    },
    {
      name: 'a fraction below a rounding midpoint',
      integer: (1n << 55n) + 3n,
      totalBits: 57,
      fractionalBits: 55,
      expectedValue: 1,
    },
    {
      name: 'a midpoint with the lower even significand',
      integer: (1n << 53n) + 1n,
      totalBits: 55,
      fractionalBits: 53,
      expectedValue: 1,
    },
    {
      name: 'a fraction above a rounding midpoint',
      integer: (1n << 54n) + 3n,
      totalBits: 56,
      fractionalBits: 54,
      expectedValue: 1.0000000000000002,
    },
    {
      name: 'a midpoint with the upper even significand',
      integer: (1n << 53n) + 3n,
      totalBits: 55,
      fractionalBits: 53,
      expectedValue: 1.0000000000000004,
    },
    {
      name: 'rounding into the next exponent',
      integer: (1n << 54n) - 1n,
      totalBits: 55,
      fractionalBits: 53,
      expectedValue: 2,
    },
    {
      name: 'the largest finite value',
      integer: ((1n << 53n) - 1n) << 971n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: Number.MAX_VALUE,
    },
    {
      name: 'the integer just below the overflow midpoint',
      integer: (1n << 1024n) - (1n << 970n) - 1n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: Number.MAX_VALUE,
    },
    {
      name: 'the smallest normal value',
      integer: 1n,
      totalBits: 1023,
      fractionalBits: 1022,
      expectedValue: 2 ** -1022,
    },
    {
      name: 'the largest subnormal value',
      integer: (1n << 52n) - 1n,
      totalBits: 1075,
      fractionalBits: 1074,
      expectedValue: (2 ** -1022) - Number.MIN_VALUE,
    },
    {
      name: 'the smallest subnormal value',
      integer: 1n,
      totalBits: 1075,
      fractionalBits: 1074,
      expectedValue: Number.MIN_VALUE,
    },
    {
      name: 'a subnormal midpoint rounding upwards to even',
      integer: 3n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 2 * Number.MIN_VALUE,
    },
    {
      name: 'a subnormal midpoint rounding downwards to even',
      integer: 5n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 2 * Number.MIN_VALUE,
    },
    {
      name: 'the midpoint between zero and the smallest subnormal',
      integer: 1n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 0,
    },
    {
      name: 'rounding a subnormal into the normal range',
      integer: (1n << 53n) - 1n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 2 ** -1022,
    },
    {
      name: 'a value far below the smallest subnormal',
      integer: 1n,
      totalBits: 1501,
      fractionalBits: 1500,
      expectedValue: 0,
    },
    {
      name: 'the overflow midpoint',
      integer: (1n << 1024n) - (1n << 970n),
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: Infinity,
    },
    {
      name: 'a value above the overflow midpoint',
      integer: 1n << 1024n,
      totalBits: 1026,
      fractionalBits: 0,
      expectedValue: Infinity,
    },
  ])('$name in both formats and sign modes', ({
    integer, totalBits, fractionalBits, expectedValue,
  }) => {
    for (const isSigned of [false, true]) {
      expectFloatConversion(
        integer, totalBits, fractionalBits, isSigned, expectedValue,
      );
    }
    if (integer !== 0n) {
      expectFloatConversion(
        -integer, totalBits, fractionalBits, true, -expectedValue,
      );
    }
  });

  it('rejects unsigned overflow with 1024 integer bits', () => {
    expectFloatConversion((1n << 1024n) - 1n, 1024, 0, false, Infinity);
  });

  it('agrees with an exact decimal reference across widths and scales', () => {
    let randomState = 0x35e071a;
    for (let sample = 0; sample < 256; sample++) {
      const totalBits = 1 + ((sample * 37) % 2200);
      const fractionalBits = (sample * 131) % (totalBits + 1);
      const isSigned = sample % 2 === 1;
      let integer = 0n;
      for (let bit = 0; bit < totalBits; bit++) {
        randomState ^= randomState << 13;
        randomState ^= randomState >>> 17;
        randomState ^= randomState << 5;
        integer = (integer << 1n) | BigInt(randomState >>> 31);
      }
      if (isSigned && integer >= 2n ** BigInt(totalBits - 1)) {
        integer -= 2n ** BigInt(totalBits);
      }
      const decimalCoefficient = integer * (5n ** BigInt(fractionalBits));
      const expectedValue = Number(
        `${decimalCoefficient.toString()}e-${fractionalBits.toString()}`,
      );
      expectFloatConversion(
        integer, totalBits, fractionalBits, isSigned, expectedValue,
      );
    }
  });
});
