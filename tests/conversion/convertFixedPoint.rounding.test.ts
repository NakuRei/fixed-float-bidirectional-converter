import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

function expectFloatConversion(
  integer: bigint,
  totalBits: number,
  fractionalBits: number,
  isSigned: boolean,
  expectedValue: number,
  expectedStatus: 'exact' | 'rounded' | 'overflow',
): void {
  const unsignedInteger = integer < 0n
    ? integer + (2n ** BigInt(totalBits))
    : integer;
  const binaryString = unsignedInteger.toString(2).padStart(totalBits, '0');
  for (const inputFormat of [InputFormat.Binary, InputFormat.Hexadecimal]) {
    const inputString = inputFormat === InputFormat.Binary
      ? binaryString
      : unsignedInteger.toString(16).padStart(Math.ceil(totalBits / 4), '0');
    const outcome = convertFixedPoint({
      inputString,
      inputFormat,
      isSigned,
      integerBitsString: (totalBits - fractionalBits).toString(),
      fractionalBitsString: fractionalBits.toString(),
    });
    expect(outcome).toMatchObject({
      status: 'success',
      result: {
        binary: {
          status: inputFormat === InputFormat.Binary ? 'original' : 'exact',
          value: binaryString,
        },
      },
    });
    if (outcome.status === 'success') {
      expect(outcome.result.decimal).toEqual(expectedStatus === 'overflow'
        ? { status: 'overflow' }
        : {
          status: expectedStatus,
          value: expectedValue.toString(),
        });
    }
  }
}

describe('convertFixedPoint binary64 rounding', () => {
  it.each([
    {
      name: 'zero with 1025 integer bits',
      expectedStatus: 'exact',
      integer: 0n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: 0,
    },
    {
      name: 'one with 1025 integer bits',
      expectedStatus: 'exact',
      integer: 1n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: 1,
    },
    {
      name: 'one with a wide integer and fraction',
      expectedStatus: 'exact',
      integer: 1n << 1500n,
      totalBits: 1502,
      fractionalBits: 1500,
      expectedValue: 1,
    },
    {
      name: 'an integer above a rounding midpoint',
      expectedStatus: 'rounded',
      integer: (1n << 54n) + 3n,
      totalBits: 56,
      fractionalBits: 0,
      expectedValue: 18014398509481988,
    },
    {
      name: 'a fraction below a rounding midpoint',
      expectedStatus: 'rounded',
      integer: (1n << 55n) + 3n,
      totalBits: 57,
      fractionalBits: 55,
      expectedValue: 1,
    },
    {
      name: 'a midpoint with the lower even significand',
      expectedStatus: 'rounded',
      integer: (1n << 53n) + 1n,
      totalBits: 55,
      fractionalBits: 53,
      expectedValue: 1,
    },
    {
      name: 'a fraction above a rounding midpoint',
      expectedStatus: 'rounded',
      integer: (1n << 54n) + 3n,
      totalBits: 56,
      fractionalBits: 54,
      expectedValue: 1.0000000000000002,
    },
    {
      name: 'a midpoint with the upper even significand',
      expectedStatus: 'rounded',
      integer: (1n << 53n) + 3n,
      totalBits: 55,
      fractionalBits: 53,
      expectedValue: 1.0000000000000004,
    },
    {
      name: 'rounding into the next exponent',
      expectedStatus: 'rounded',
      integer: (1n << 54n) - 1n,
      totalBits: 55,
      fractionalBits: 53,
      expectedValue: 2,
    },
    {
      name: 'the largest finite value',
      expectedStatus: 'exact',
      integer: ((1n << 53n) - 1n) << 971n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: Number.MAX_VALUE,
    },
    {
      name: 'the integer just below the overflow midpoint',
      expectedStatus: 'rounded',
      integer: (1n << 1024n) - (1n << 970n) - 1n,
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: Number.MAX_VALUE,
    },
    {
      name: 'the smallest normal value',
      expectedStatus: 'exact',
      integer: 1n,
      totalBits: 1023,
      fractionalBits: 1022,
      expectedValue: 2 ** -1022,
    },
    {
      name: 'the largest subnormal value',
      expectedStatus: 'exact',
      integer: (1n << 52n) - 1n,
      totalBits: 1075,
      fractionalBits: 1074,
      expectedValue: (2 ** -1022) - Number.MIN_VALUE,
    },
    {
      name: 'the smallest subnormal value',
      expectedStatus: 'exact',
      integer: 1n,
      totalBits: 1075,
      fractionalBits: 1074,
      expectedValue: Number.MIN_VALUE,
    },
    {
      name: 'a subnormal midpoint rounding upwards to even',
      expectedStatus: 'rounded',
      integer: 3n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 2 * Number.MIN_VALUE,
    },
    {
      name: 'a subnormal midpoint rounding downwards to even',
      expectedStatus: 'rounded',
      integer: 5n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 2 * Number.MIN_VALUE,
    },
    {
      name: 'the midpoint between zero and the smallest subnormal',
      expectedStatus: 'rounded',
      integer: 1n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 0,
    },
    {
      name: 'rounding a subnormal into the normal range',
      expectedStatus: 'rounded',
      integer: (1n << 53n) - 1n,
      totalBits: 1076,
      fractionalBits: 1075,
      expectedValue: 2 ** -1022,
    },
    {
      name: 'a value far below the smallest subnormal',
      expectedStatus: 'rounded',
      integer: 1n,
      totalBits: 1501,
      fractionalBits: 1500,
      expectedValue: 0,
    },
    {
      name: 'the overflow midpoint',
      expectedStatus: 'overflow',
      integer: (1n << 1024n) - (1n << 970n),
      totalBits: 1025,
      fractionalBits: 0,
      expectedValue: Infinity,
    },
    {
      name: 'a value above the overflow midpoint',
      expectedStatus: 'overflow',
      integer: 1n << 1024n,
      totalBits: 1026,
      fractionalBits: 0,
      expectedValue: Infinity,
    },
  ] as const)('$name in both formats and sign modes', ({
    integer, totalBits, fractionalBits, expectedValue, expectedStatus,
  }) => {
    for (const isSigned of [false, true]) {
      expectFloatConversion(
        integer,
        totalBits,
        fractionalBits,
        isSigned,
        expectedValue,
        expectedStatus,
      );
    }
    if (integer !== 0n) {
      expectFloatConversion(
        -integer,
        totalBits,
        fractionalBits,
        true,
        -expectedValue,
        expectedStatus,
      );
    }
  });

  it('preserves unsigned bits when Float64 overflows', () => {
    expectFloatConversion(
      (1n << 1024n) - 1n, 1024, 0, false, Infinity, 'overflow',
    );
  });
});
