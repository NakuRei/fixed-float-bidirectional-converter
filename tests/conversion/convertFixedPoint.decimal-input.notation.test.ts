import { describe, expect, it } from 'vitest';
import {
  OverflowMode,
  InputFormat,
  RoundingMode,
  type ConversionInput,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

const decimalInput = {
  overflowMode: OverflowMode.Error,
  inputString: '-3.1875',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.TiesToEven,
} satisfies ConversionInput;

describe('convertFixedPoint decimal input notation', () => {
  it.each([
    ['+3.1875', '33'],
    ['003.187500', '33'],
    ['.5', '08'],
    ['-.5', 'F8'],
    ['3.', '30'],
    ['-0', '00'],
    ['-0.000', '00'],
    ['3.1875e0', '33'],
    ['31875e-4', '33'],
    ['-31875E-4', 'CD'],
    ['.031875e+2', '33'],
  ])('accepts decimal notation %s', (inputString, hexString) => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
    })).toMatchObject({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'exact',
          value: hexString,
        },
        decimal: {
          status: 'original',
          value: inputString,
        },
      },
    });
  });

  it.each(['0e999999999999999999999', '-0e-999999999999999999999'])(
    'encodes zero with an extreme exponent: %s',
    (inputString) => {
      expect(convertFixedPoint({
        ...decimalInput,
        inputString,
      })).toMatchObject({
        status: 'success',
        result: {
          hexadecimal: {
            status: 'exact',
            value: '00',
          },
          decimal: {
            status: 'original',
            value: inputString,
          },
        },
      });
    },
  );

  it.each([' -3.1875', '-3.1875 ', '\n-3.1875', '-3.1875\r\n'])(
    'accepts decimal input %j surrounded by whitespace',
    (inputString) => {
      expect(convertFixedPoint({
        ...decimalInput,
        inputString,
      })).toEqual({
        status: 'success',
        result: {
          hexadecimal: {
            status: 'exact',
            value: 'CD',
          },
          binary: {
            status: 'exact',
            value: '11001101',
          },
          decimal: {
            status: 'original',
            value: '-3.1875',
          },
        },
      });
    },
  );

  it('returns empty when the decimal input is cleared', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '',
    })).toEqual({ status: 'empty' });
  });

  it('returns empty for whitespace-only decimal input', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: ' \n\t',
    })).toEqual({ status: 'empty' });
  });

  it.each([
    '- 3.1875',
    '.',
    '+',
    '-',
    '1.2.3',
    '1e',
    '1e+',
    '1e1.5',
    'NaN',
    'Infinity',
    '-Infinity',
    '1_000',
    '1,5',
    '3.1875x',
    '--1',
    '+-1',
  ])('rejects malformed decimal input %s', (inputString) => {
    const outcome = convertFixedPoint({
      ...decimalInput,
      inputString,
    });
    expect(outcome).toEqual({
      status: 'invalid',
      diagnostic: {
        code: 'malformed-decimal',
        fields: ['inputString'],
      },
    });
  });

  it.each([
    ['0x10', InputFormat.Hexadecimal],
    ['0b10', InputFormat.Binary],
    [' 0B10 ', InputFormat.Binary],
  ] as const)('points %j to the format its prefix denotes', (
    inputString, prefixFormat,
  ) => {
    const outcome = convertFixedPoint({
      ...decimalInput,
      inputString,
    });
    expect(outcome).toEqual({
      status: 'invalid',
      diagnostic: {
        code: 'foreign-prefix',
        prefixFormat,
        fields: ['inputString'],
      },
    });
  });
});
