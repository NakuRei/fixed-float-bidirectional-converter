import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/constants/InputFormat';
import { RoundingMode } from '../../src/constants/RoundingMode';
import {
  convertFixedPoint,
  type ConversionInput,
} from '../../src/utils/convertFixedPoint';

const decimalInput: ConversionInput = {
  inputString: '-3.1875',
  inputType: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.NearestEven,
};

describe('convertFixedPoint decimal encoding', () => {
  it.each([
    ['-3.1875', 4, 4, true, 'CD', '11001101'],
    ['3.1875', 4, 4, true, '33', '00110011'],
    ['0', 4, 4, true, '00', '00000000'],
    ['-8', 4, 4, true, '80', '10000000'],
    ['7.9375', 4, 4, true, '7F', '01111111'],
    ['15.9375', 4, 4, false, 'FF', '11111111'],
    ['12.8125', 4, 4, false, 'CD', '11001101'],
    ['-0.125', 3, 3, true, 'FF', '111111'],
    ['7.875', 3, 3, false, '3F', '111111'],
    ['0.3125', 0, 4, true, '5', '0101'],
    ['-0.3125', 0, 4, true, 'B', '1011'],
    ['-0.5', 0, 1, true, 'F', '1'],
    ['0.5', 0, 1, false, '1', '1'],
    ['-1', 1, 0, true, 'F', '1'],
    ['1', 1, 0, false, '1', '1'],
  ])('encodes %s with %i.%i bits, signed=%s', (
    inputString, integerBits, fractionalBits, isSigned, hexString, binaryString,
  ) => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
      isSigned,
    })).toEqual({
      status: 'success',
      inputWasRounded: false,
      result: {
        hexString,
        binaryString,
        float64: {
          status: 'exact',
          value: inputString,
        },
      },
    });
  });

  it.each([
    ['+3.1875', '33', '3.1875'],
    ['003.187500', '33', '3.1875'],
    ['.5', '08', '0.5'],
    ['-.5', 'F8', '-0.5'],
    ['3.', '30', '3'],
    ['-0', '00', '0'],
    ['-0.000', '00', '0'],
    ['3.1875e0', '33', '3.1875'],
    ['31875e-4', '33', '3.1875'],
    ['-31875E-4', 'CD', '-3.1875'],
    ['.031875e+2', '33', '3.1875'],
  ])('accepts decimal notation %s', (inputString, hexString, float64Value) => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
    })).toMatchObject({
      status: 'success',
      inputWasRounded: false,
      result: {
        hexString,
        float64: {
          status: 'exact',
          value: float64Value,
        },
      },
    });
  });

  it('preserves integer bits beyond floating-point precision', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '9007199254740993',
      integerBitsString: '64',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'success',
      inputWasRounded: false,
      result: {
        hexString: '0020000000000001',
        binaryString: `00000000001${'0'.repeat(52)}1`,
        float64: {
          status: 'rounded',
          value: '9007199254740992',
        },
      },
    });
  });

  it.each(['1', '-1'])('encodes %s with a wide fraction', (inputString) => {
    const binaryString = inputString === '1'
      ? `01${'0'.repeat(1500)}`
      : `11${'0'.repeat(1500)}`;
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
      integerBitsString: '2',
      fractionalBitsString: '1500',
    })).toMatchObject({
      status: 'success',
      inputWasRounded: false,
      result: {
        binaryString,
        float64: {
          status: 'exact',
          value: inputString,
        },
      },
    });
  });

  it('round-trips every signed and unsigned 8-bit fixed-point value', () => {
    for (const isSigned of [false, true]) {
      for (let integer = 0; integer < 256; integer += 1) {
        const hexString = integer.toString(16).padStart(2, '0')
          .toUpperCase();
        const binaryString = integer.toString(2).padStart(8, '0');
        const value = isSigned && integer >= 128
          ? (integer - 256) / 16
          : integer / 16;
        expect(convertFixedPoint({
          ...decimalInput,
          inputString: value.toString(),
          isSigned,
        })).toEqual({
          status: 'success',
          inputWasRounded: false,
          result: {
            hexString,
            binaryString,
            float64: {
              status: 'exact',
              value: value.toString(),
            },
          },
        });
      }
    }
  });

  it('returns empty when the decimal input is cleared', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '',
    })).toEqual({ status: 'empty' });
  });

  it.each([
    ' ',
    ' 1',
    '1 ',
    '\n1',
    '1\n',
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
    '0x10',
    '0b10',
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
    ['8', true],
    ['-8.0625', true],
    ['16', false],
    ['-1', false],
  ])('rejects %s outside the fixed-point range, signed=%s', (
    inputString, isSigned,
  ) => {
    const outcome = convertFixedPoint({
      ...decimalInput,
      inputString,
      isSigned,
    });
    expect(outcome).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
    });
    if (outcome.status === 'invalid') {
      expect(outcome.message).toMatch(/fixed-point range/iu);
    }
  });
});
