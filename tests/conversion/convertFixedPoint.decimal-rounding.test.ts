import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
import { RoundingMode } from '../../src/conversion/RoundingMode';
import {
  convertFixedPoint,
  type ConversionInput,
} from '../../src/conversion/convertFixedPoint';

const decimalInput: ConversionInput = {
  inputString: '0.1',
  inputType: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.NearestEven,
};

describe('Decimal quantization', () => {
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
        binary: { status: 'rounded' },
        hex: {
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
        binary: { status: 'rounded' },
        hex: {
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

  it('encodes an exact fraction beyond floating-point precision', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '1.000000000000000055511151231257827021181583404541015625',
      integerBitsString: '2',
      fractionalBitsString: '54',
      roundingMode: RoundingMode.Exact,
    })).toEqual({
      status: 'success',
      result: {
        hex: {
          status: 'exact',
          value: '40000000000001',
        },
        binary: {
          status: 'exact',
          value: `01${'0'.repeat(53)}1`,
        },
        decimal: {
          status: 'original',
          value: '1.000000000000000055511151231257827021181583404541015625',
        },
      },
    });
  });

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
        hex: {
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

  it.each(Object.values(RoundingMode))('rejects overflow before rounding: %s', (
    roundingMode,
  ) => {
    for (const [inputString, isSigned] of [
      ['7.93750000000000000001', true],
      ['-8.00000000000000000001', true],
      ['15.93750000000000000001', false],
      ['-0.00000000000000000001', false],
      ['1e999999999999999999999', true],
      ['-1e-999999999999999999999', false],
    ] as const) {
      const outcome = convertFixedPoint({
        ...decimalInput,
        inputString,
        isSigned,
        roundingMode,
      });
      expect(outcome).toMatchObject({
        status: 'invalid',
        invalidFields: ['inputString'],
      });
      if (outcome.status === 'invalid') {
        expect(outcome.message).toMatch(/fixed-point range/u);
      }
    }
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
            hex: {
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

  it('rejects positive input when the single bit is the sign bit', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '1e-999999999999999999999',
      integerBitsString: '0',
      fractionalBitsString: '1',
    })).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
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
          hex: {
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

  it('allows the supported maximum bit width', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '0',
      integerBitsString: '16384',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'success',
      result: {
        binary: {
          status: 'exact',
          value: '0'.repeat(16384),
        },
        hex: {
          status: 'exact',
          value: '0'.repeat(4096),
        },
        decimal: {
          status: 'original',
          value: '0',
        },
      },
    });
  });

  it('explains that zero total bits is below the minimum', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '',
      integerBitsString: '0',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'invalid',
      message: 'Total bit count must be at least 1.',
      invalidFields: ['integerBitsString', 'fractionalBitsString'],
    });
  });

  it.each(['16385', '9007199254740991'])(
    'rejects a bit width of %s before allocating the output',
    (integerBitsString) => {
      expect(convertFixedPoint({
        ...decimalInput,
        inputString: '0',
        integerBitsString,
        fractionalBitsString: '0',
      })).toEqual({
        status: 'invalid',
        message: 'Decimal conversion supports at most 16384 total bits.',
        invalidFields: ['integerBitsString', 'fractionalBitsString'],
      });
    },
  );
});
