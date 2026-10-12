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

describe('convertFixedPoint decimal input rounding', () => {
  it.each([
    ['1.28', '14'],
    ['0.1', '02'],
    ['-0.1', 'FE'],
    ['0.03125', '00'],
    ['-0.03125', '00'],
    ['0.09375', '02'],
    ['-0.09375', 'FE'],
    ['0.15625', '02'],
    ['-0.15625', 'FE'],
    ['0.21875', '04'],
    ['-0.21875', 'FC'],
    ['0.0312500000000000000000000001', '01'],
    ['-0.0312500000000000000000000001', 'FF'],
    ['0.0312499999999999999999999999', '00'],
    ['-0.0312499999999999999999999999', '00'],
  ])('rounds %s to nearest, breaking ties to even', (
    inputString, hexString,
  ) => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
      roundingMode: RoundingMode.NearestEven,
    })).toMatchObject({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'rounded',
          value: hexString,
        },
        decimal: {
          status: 'original',
          value: inputString,
        },
      },
    });
  });

  it.each([
    ['1.28', '14'],
    ['0.1', '01'],
    ['-0.1', 'FF'],
    ['0.03125', '00'],
    ['-0.03125', '00'],
    ['0.09375', '01'],
    ['-0.09375', 'FF'],
  ])('truncates %s toward zero', (inputString, hexString) => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
      roundingMode: RoundingMode.TowardZero,
    })).toMatchObject({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'rounded',
          value: hexString,
        },
        decimal: {
          status: 'original',
          value: inputString,
        },
      },
    });
  });

  it.each([RoundingMode.NearestEven, RoundingMode.TowardZero])(
    'rounds extremely small values to zero in %s mode',
    (roundingMode) => {
      for (const sign of ['', '-']) {
        expect(convertFixedPoint({
          ...decimalInput,
          inputString: `${sign}1e-999999999999999999999`,
          roundingMode,
        })).toEqual({
          status: 'success',
          result: {
            hexadecimal: {
              status: 'rounded',
              value: '00',
            },
            binary: {
              status: 'rounded',
              value: '00000000',
            },
            decimal: {
              status: 'original',
              value: `${sign}1e-999999999999999999999`,
            },
          },
        });
      }
    },
  );

  it.each(Object.values(RoundingMode))('accepts exact values in %s mode', (
    roundingMode,
  ) => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '-3.1875',
      roundingMode,
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
  });

  it.each(['0.1', '-0.1', '0.03125', '1e-999999999999999999999'])(
    'rejects inexact %s in exact mode',
    (inputString) => {
      const outcome = convertFixedPoint({
        ...decimalInput,
        inputString,
        roundingMode: RoundingMode.Exact,
      });
      expect(outcome).toMatchObject({
        status: 'invalid',
        invalidFields: ['inputString'],
      });
      if (outcome.status === 'invalid') {
        expect(outcome.message).toMatch(/cannot be represented exactly/u);
      }
    },
  );

  it('rejects inexact input even if Float64 displays it unchanged', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '0.1',
      integerBitsString: '1',
      fractionalBitsString: '55',
      roundingMode: RoundingMode.Exact,
    })).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
    });
  });
});
