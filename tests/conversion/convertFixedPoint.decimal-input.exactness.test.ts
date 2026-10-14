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
  roundingMode: RoundingMode.Exact,
};

describe('convertFixedPoint decimal input exactness', () => {
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
      expect(outcome).toEqual({
        status: 'invalid',
        diagnostic: {
          code: 'inexact-value',
          fields: ['inputString'],
        },
      });
    },
  );

  it('rejects inexact input even if Float64 displays it unchanged', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '0.1',
      integerBitsString: '1',
      fractionalBitsString: '55',
      roundingMode: RoundingMode.Exact,
    })).toEqual({
      status: 'invalid',
      diagnostic: {
        code: 'inexact-value',
        fields: ['inputString'],
      },
    });
  });
});
