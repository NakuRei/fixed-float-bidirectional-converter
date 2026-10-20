import { describe, it, expect } from 'vitest';
import {
  OverflowMode,
  InputFormat,
  RoundingMode,
  type ConversionDiagnostic,
  type ConversionInput,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

const bitPatternInput = {
  overflowMode: OverflowMode.Error,
  inputString: '01001101',
  inputFormat: InputFormat.Binary,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
} satisfies ConversionInput;

const decimalInput = {
  overflowMode: OverflowMode.Error,
  inputString: '0',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.TiesToEven,
} satisfies ConversionInput;

const bothBitCountFields = [
  'integerBitsString',
  'fractionalBitsString',
] as const;

const decimalBitLimit = {
  code: 'total-bits-exceeded',
  inputFormat: InputFormat.Decimal,
  maximum: 16384,
  fields: bothBitCountFields,
} as const;

function expectInvalidConversion(
  input: ConversionInput,
  diagnostic: ConversionDiagnostic,
): void {
  expect(convertFixedPoint(input)).toEqual({
    status: 'invalid',
    diagnostic,
  });
}

describe('convertFixedPoint total bit limits', () => {
  it.each([InputFormat.Binary, InputFormat.Hexadecimal])(
    'reports the safe-integer limit for an unsafe %s total',
    (inputFormat) => {
      expectInvalidConversion({
        ...bitPatternInput,
        inputFormat,
        integerBitsString: '9007199254740991',
        fractionalBitsString: '1',
      }, {
        code: 'total-bits-exceeded',
        inputFormat,
        maximum: Number.MAX_SAFE_INTEGER,
        fields: bothBitCountFields,
      });
    },
  );

  it.each([
    {
      inputFormat: InputFormat.Binary,
      inputString: '0'.repeat(16388),
      hexadecimal: {
        status: 'exact',
        value: '0'.repeat(4097),
      },
      binary: {
        status: 'original',
        value: '0'.repeat(16388),
      },
    },
    {
      inputFormat: InputFormat.Hexadecimal,
      inputString: '0'.repeat(4097),
      hexadecimal: {
        status: 'original',
        value: '0'.repeat(4097),
      },
      binary: {
        status: 'exact',
        value: '0'.repeat(16388),
      },
    },
  ] as const)(
    'accepts $inputFormat patterns beyond the decimal input bit limit',
    ({ inputFormat, inputString, hexadecimal, binary }) => {
      expect(convertFixedPoint({
        ...bitPatternInput,
        inputFormat,
        inputString,
        integerBitsString: '16388',
        fractionalBitsString: '0',
      })).toEqual({
        status: 'success',
        result: {
          hexadecimal,
          binary,
          decimal: {
            status: 'exact',
            value: '0',
          },
        },
      });
    },
  );

  it('allows the supported maximum bit width', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      integerBitsString: '16384',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'exact',
          value: '0'.repeat(4096),
        },
        binary: {
          status: 'exact',
          value: '0'.repeat(16384),
        },
        decimal: {
          status: 'original',
          value: '0',
        },
      },
    });
  });

  it.each([
    ['16385', '0'],
    ['9007199254740991', '0'],
    ['9007199254740991', '1'],
  ])(
    'rejects a Decimal bit width of %s + %s before allocating the output',
    (integerBitsString, fractionalBitsString) => {
      expectInvalidConversion({
        ...decimalInput,
        integerBitsString,
        fractionalBitsString,
      }, decimalBitLimit);
    },
  );

  it('reports the Decimal limit with an unsafe total and empty input', () => {
    expectInvalidConversion({
      ...decimalInput,
      inputString: '',
      integerBitsString: '9007199254740991',
      fractionalBitsString: '1',
    }, decimalBitLimit);
  });
});
