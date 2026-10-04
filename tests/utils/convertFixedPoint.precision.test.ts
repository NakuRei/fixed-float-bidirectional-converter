import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/constants/InputFormat';
import { RoundingMode } from '../../src/constants/RoundingMode';
import type { ConversionResults } from '../../src/types/ConversionResults';
import {
  convertFixedPoint,
  type ConversionInput,
} from '../../src/utils/convertFixedPoint';

const decimalInput: ConversionInput = {
  inputString: '0.1',
  inputType: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '1',
  fractionalBitsString: '55',
  roundingMode: RoundingMode.NearestEven,
};

function expectEquivalentFormats(
  input: ConversionInput,
  result: ConversionResults,
  inputWasRounded: boolean,
): void {
  expect(convertFixedPoint(input)).toEqual({
    status: 'success',
    inputWasRounded,
    result,
  });
  for (const [inputType, inputString] of [
    [InputFormat.Binary, result.binaryString],
    [InputFormat.Hexadecimal, result.hexString],
  ] as const) {
    expect(convertFixedPoint({
      inputType,
      inputString,
      isSigned: input.isSigned,
      integerBitsString: input.integerBitsString,
      fractionalBitsString: input.fractionalBitsString,
    })).toEqual({
      status: 'success',
      inputWasRounded: false,
      result,
    });
  }
}

describe('Fixed-point and Float64 precision', () => {
  it.each([
    {
      fractionalBits: 55,
      roundingMode: RoundingMode.NearestEven,
      integer: 3602879701896397n,
      hexString: '0CCCCCCCCCCCCD',
      float64: {
        status: 'exact',
        value: '0.1',
      },
    },
    {
      fractionalBits: 55,
      roundingMode: RoundingMode.TowardZero,
      integer: 3602879701896396n,
      hexString: '0CCCCCCCCCCCCC',
      float64: {
        status: 'exact',
        value: '0.09999999999999998',
      },
    },
    {
      fractionalBits: 60,
      roundingMode: RoundingMode.NearestEven,
      integer: 115292150460684698n,
      hexString: '019999999999999A',
      float64: {
        status: 'rounded',
        value: '0.1',
      },
    },
  ] as const)(
    'distinguishes quantization from Float64 with $fractionalBits bits, '
    + '$roundingMode',
    ({ fractionalBits, roundingMode, integer, hexString, float64 }) => {
      expectEquivalentFormats({
        ...decimalInput,
        fractionalBitsString: fractionalBits.toString(),
        roundingMode,
      }, {
        binaryString: integer.toString(2).padStart(fractionalBits + 1, '0'),
        hexString,
        float64,
      }, true);
    },
  );

  it('rejects inexact input even if Float64 displays it unchanged', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      roundingMode: RoundingMode.Exact,
    })).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
    });
  });

  it('allows Float64 precision loss in Exact only mode', () => {
    expectEquivalentFormats({
      ...decimalInput,
      inputString: '9007199254740993',
      integerBitsString: '64',
      fractionalBitsString: '0',
      roundingMode: RoundingMode.Exact,
    }, {
      hexString: '0020000000000001',
      binaryString: `00000000001${'0'.repeat(52)}1`,
      float64: {
        status: 'rounded',
        value: '9007199254740992',
      },
    }, false);
  });

  it.each([
    ['1e309', 10n ** 309n],
    ['-1e309', (1n << 1028n) - (10n ** 309n)],
  ] as const)('preserves %s when Float64 overflows', (
    inputString, unsignedInteger,
  ) => {
    expectEquivalentFormats({
      ...decimalInput,
      inputString,
      integerBitsString: '1028',
      fractionalBitsString: '0',
      roundingMode: RoundingMode.Exact,
    }, {
      hexString: unsignedInteger.toString(16).padStart(257, '0')
        .toUpperCase(),
      binaryString: unsignedInteger.toString(2).padStart(1028, '0'),
      float64: { status: 'overflow' },
    }, false);
  });

  it.each([
    ['', `${'0'.repeat(1100)}1`, `${'0'.repeat(275)}1`],
    ['-', '1'.repeat(1101), 'F'.repeat(276)],
  ])('preserves exact %s2^-1100 when Float64 underflows', (
    sign, binaryString, hexString,
  ) => {
    expectEquivalentFormats({
      ...decimalInput,
      inputString: `${sign}${(5n ** 1100n).toString()}e-1100`,
      fractionalBitsString: '1100',
      roundingMode: RoundingMode.Exact,
    }, {
      hexString,
      binaryString,
      float64: {
        status: 'rounded',
        value: '0',
      },
    }, false);
  });
});
