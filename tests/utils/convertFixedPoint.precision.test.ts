import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/constants/InputFormat';
import { RoundingMode } from '../../src/constants/RoundingMode';
import type { Float64Result } from '../../src/types/ConversionResults';
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

function expectEncodingAndDecoding(
  input: ConversionInput,
  expected: { binary: string;
    hex: string;
    decimal: Float64Result; },
  fixedPointStatus: 'exact' | 'rounded',
): void {
  expect(convertFixedPoint(input)).toEqual({
    status: 'success',
    result: {
      hex: {
        status: fixedPointStatus,
        value: expected.hex,
      },
      binary: {
        status: fixedPointStatus,
        value: expected.binary,
      },
      decimal: {
        status: 'original',
        value: input.inputString,
      },
    },
  });
  for (const [inputType, inputString] of [
    [InputFormat.Binary, expected.binary],
    [InputFormat.Hexadecimal, expected.hex],
  ] as const) {
    expect(convertFixedPoint({
      inputType,
      inputString,
      isSigned: input.isSigned,
      integerBitsString: input.integerBitsString,
      fractionalBitsString: input.fractionalBitsString,
    })).toEqual({
      status: 'success',
      result: {
        hex: {
          status: inputType === InputFormat.Hexadecimal ? 'original' : 'exact',
          value: expected.hex,
        },
        binary: {
          status: inputType === InputFormat.Binary ? 'original' : 'exact',
          value: expected.binary,
        },
        decimal: expected.decimal,
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
      hex: '0CCCCCCCCCCCCD',
      decimal: {
        status: 'exact',
        value: '0.1',
      },
    },
    {
      fractionalBits: 55,
      roundingMode: RoundingMode.TowardZero,
      integer: 3602879701896396n,
      hex: '0CCCCCCCCCCCCC',
      decimal: {
        status: 'exact',
        value: '0.09999999999999998',
      },
    },
    {
      fractionalBits: 60,
      roundingMode: RoundingMode.NearestEven,
      integer: 115292150460684698n,
      hex: '019999999999999A',
      decimal: {
        status: 'rounded',
        value: '0.1',
      },
    },
  ] as const)(
    'distinguishes quantization from Float64 with $fractionalBits bits, '
    + '$roundingMode',
    ({ fractionalBits, roundingMode, integer, hex, decimal }) => {
      expectEncodingAndDecoding({
        ...decimalInput,
        fractionalBitsString: fractionalBits.toString(),
        roundingMode,
      }, {
        binary: integer.toString(2).padStart(fractionalBits + 1, '0'),
        hex,
        decimal,
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

  it('allows Float64 precision loss in Exact only mode', () => {
    expectEncodingAndDecoding({
      ...decimalInput,
      inputString: '9007199254740993',
      integerBitsString: '64',
      fractionalBitsString: '0',
      roundingMode: RoundingMode.Exact,
    }, {
      hex: '0020000000000001',
      binary: `00000000001${'0'.repeat(52)}1`,
      decimal: {
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
      hex: unsignedInteger.toString(16).padStart(257, '0')
        .toUpperCase(),
      binary: unsignedInteger.toString(2).padStart(1028, '0'),
      decimal: { status: 'overflow' },
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
      hex: hexString,
      binary: binaryString,
      decimal: {
        status: 'rounded',
        value: '0',
      },
    }, 'exact');
  });
});
