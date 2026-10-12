import { describe, expect, it } from 'vitest';
import {
  InputFormat,
  RoundingMode,
  type ConversionInput,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

const decimalInput: ConversionInput = {
  inputString: '-3.1875',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.NearestEven,
};

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
        inputFormat: InputFormat.Decimal,
        inputString,
        fixedPoint: {
          status: 'exact',
          hexadecimal: hexString,
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
          inputFormat: InputFormat.Decimal,
          inputString,
          fixedPoint: {
            status: 'exact',
            hexadecimal: '00',
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
          inputFormat: InputFormat.Decimal,
          inputString: '-3.1875',
          fixedPoint: {
            status: 'exact',
            hexadecimal: 'CD',
            binary: '11001101',
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
    expect(outcome).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
    });
    if (outcome.status === 'invalid') {
      expect(outcome.message).toMatch(/decimal/iu);
    }
  });

  it.each([
    ['0x10', /Select Hexadecimal/u],
    ['0b10', /Select Binary/u],
    [' 0B10 ', /Select Binary/u],
  ] as const)('points %j to the format its prefix denotes', (
    inputString, message,
  ) => {
    const outcome = convertFixedPoint({
      ...decimalInput,
      inputString,
    });
    expect(outcome).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
    });
    if (outcome.status === 'invalid') {
      expect(outcome.message).toMatch(message);
    }
  });
});
