import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
import { RoundingMode } from '../../src/conversion/RoundingMode';
import {
  convertFixedPoint,
  type ConversionInput,
} from '../../src/conversion/convertFixedPoint';
import type { Float64Result } from '../../src/conversion/decodeFixedPointFloat64';

const decimalInput: ConversionInput = {
  inputString: '0.1',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '1',
  fractionalBitsString: '55',
  roundingMode: RoundingMode.NearestEven,
};

function expectEncodingAndDecoding(
  input: ConversionInput,
  expected: { binary: string;
    hexadecimal: string;
    float64: Float64Result; },
  fixedPointStatus: 'exact' | 'rounded',
): void {
  expect(convertFixedPoint(input)).toEqual({
    status: 'success',
    result: {
      inputFormat: InputFormat.Decimal,
      inputString: input.inputString,
      fixedPoint: {
        status: fixedPointStatus,
        hexadecimal: expected.hexadecimal,
        binary: expected.binary,
      },
    },
  });
  for (const [inputFormat, inputString] of [
    [InputFormat.Binary, expected.binary],
    [InputFormat.Hexadecimal, expected.hexadecimal],
  ] as const) {
    expect(convertFixedPoint({
      inputFormat,
      inputString,
      isSigned: input.isSigned,
      integerBitsString: input.integerBitsString,
      fractionalBitsString: input.fractionalBitsString,
    })).toEqual({
      status: 'success',
      result: {
        inputFormat,
        inputString,
        fixedPoint: {
          status: 'exact',
          hexadecimal: expected.hexadecimal,
          binary: expected.binary,
        },
        float64: expected.float64,
      },
    });
  }
}

describe('Fixed-point and Float64 precision', () => {
  it.each([
    {
      fractionalBits: 55,
      roundingMode: RoundingMode.NearestEven,
      integer: 3602879701896397n,
      hexadecimal: '0CCCCCCCCCCCCD',
      float64: {
        status: 'exact',
        value: '0.1',
      },
    },
    {
      fractionalBits: 55,
      roundingMode: RoundingMode.TowardZero,
      integer: 3602879701896396n,
      hexadecimal: '0CCCCCCCCCCCCC',
      float64: {
        status: 'exact',
        value: '0.09999999999999998',
      },
    },
    {
      fractionalBits: 60,
      roundingMode: RoundingMode.NearestEven,
      integer: 115292150460684698n,
      hexadecimal: '019999999999999A',
      float64: {
        status: 'rounded',
        value: '0.1',
      },
    },
  ] as const)(
    'distinguishes quantization from Float64 with $fractionalBits bits, '
    + '$roundingMode',
    ({ fractionalBits, roundingMode, integer, hexadecimal, float64 }) => {
      expectEncodingAndDecoding({
        ...decimalInput,
        fractionalBitsString: fractionalBits.toString(),
        roundingMode,
      }, {
        binary: integer.toString(2).padStart(fractionalBits + 1, '0'),
        hexadecimal,
        float64,
      }, 'rounded');
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

  it('allows Float64 precision loss in exact mode', () => {
    expectEncodingAndDecoding({
      ...decimalInput,
      inputString: '9007199254740993',
      integerBitsString: '64',
      fractionalBitsString: '0',
      roundingMode: RoundingMode.Exact,
    }, {
      hexadecimal: '0020000000000001',
      binary: `00000000001${'0'.repeat(52)}1`,
      float64: {
        status: 'rounded',
        value: '9007199254740992',
      },
    }, 'exact');
  });

  it.each([
    ['1e309', 10n ** 309n],
    ['-1e309', (1n << 1028n) - (10n ** 309n)],
  ] as const)('preserves %s when Float64 overflows', (
    inputString, unsignedInteger,
  ) => {
    expectEncodingAndDecoding({
      ...decimalInput,
      inputString,
      integerBitsString: '1028',
      fractionalBitsString: '0',
      roundingMode: RoundingMode.Exact,
    }, {
      hexadecimal: unsignedInteger.toString(16).padStart(257, '0')
        .toUpperCase(),
      binary: unsignedInteger.toString(2).padStart(1028, '0'),
      float64: { status: 'overflow' },
    }, 'exact');
  });

  it.each([
    ['', `${'0'.repeat(1100)}1`, `${'0'.repeat(275)}1`],
    ['-', '1'.repeat(1101), 'F'.repeat(276)],
  ])('preserves exact %s2^-1100 when Float64 underflows', (
    sign, binaryString, hexString,
  ) => {
    expectEncodingAndDecoding({
      ...decimalInput,
      inputString: `${sign}${(5n ** 1100n).toString()}e-1100`,
      fractionalBitsString: '1100',
      roundingMode: RoundingMode.Exact,
    }, {
      hexadecimal: hexString,
      binary: binaryString,
      float64: {
        status: 'rounded',
        value: '0',
      },
    }, 'exact');
  });
});
