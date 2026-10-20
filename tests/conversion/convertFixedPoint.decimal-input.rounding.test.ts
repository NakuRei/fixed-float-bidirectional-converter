import { describe, expect, it } from 'vitest';
import {
  OverflowMode,
  InputFormat,
  RoundingMode,
  type ConversionInput,
  type RoundingModeType,
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

function expectRoundedHexadecimal(
  inputString: string,
  roundingMode: RoundingModeType,
  hexString: string,
): void {
  expect(convertFixedPoint({
    ...decimalInput,
    inputString,
    roundingMode,
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
}

/*
 * The inputs scale to 20.48, ±1.6, ±0.5, ±1.5, ±2.5, ±3.5 and ±0.5 nudged
 * either side of the tie, so each mode shows its tie rule and its direction.
 */
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
    expectRoundedHexadecimal(inputString, RoundingMode.TiesToEven, hexString);
  });

  it.each([
    ['1.28', '14'],
    ['0.1', '02'],
    ['-0.1', 'FE'],
    ['0.03125', '01'],
    ['-0.03125', 'FF'],
    ['0.09375', '02'],
    ['-0.09375', 'FE'],
    ['0.15625', '03'],
    ['-0.15625', 'FD'],
    ['0.21875', '04'],
    ['-0.21875', 'FC'],
    ['0.0312500000000000000000000001', '01'],
    ['-0.0312500000000000000000000001', 'FF'],
    ['0.0312499999999999999999999999', '00'],
    ['-0.0312499999999999999999999999', '00'],
  ])('rounds %s to nearest, breaking ties away from zero', (
    inputString, hexString,
  ) => {
    expectRoundedHexadecimal(inputString, RoundingMode.TiesToAway, hexString);
  });

  it.each([
    ['1.28', '14'],
    ['0.1', '02'],
    ['-0.1', 'FE'],
    ['0.03125', '01'],
    ['-0.03125', '00'],
    ['0.09375', '02'],
    ['-0.09375', 'FF'],
    ['0.15625', '03'],
    ['-0.15625', 'FE'],
    ['0.21875', '04'],
    ['-0.21875', 'FD'],
    ['0.0312500000000000000000000001', '01'],
    ['-0.0312500000000000000000000001', 'FF'],
    ['0.0312499999999999999999999999', '00'],
    ['-0.0312499999999999999999999999', '00'],
  ])('rounds %s to nearest, breaking ties toward positive infinity', (
    inputString, hexString,
  ) => {
    expectRoundedHexadecimal(
      inputString,
      RoundingMode.TiesToPositive,
      hexString,
    );
  });

  it.each([
    ['1.28', '14'],
    ['0.1', '01'],
    ['-0.1', 'FF'],
    ['0.03125', '00'],
    ['-0.03125', '00'],
    ['0.09375', '01'],
    ['-0.09375', 'FF'],
    ['0.15625', '02'],
    ['-0.15625', 'FE'],
    ['0.21875', '03'],
    ['-0.21875', 'FD'],
    ['0.0312500000000000000000000001', '00'],
    ['-0.0312500000000000000000000001', '00'],
    ['0.0312499999999999999999999999', '00'],
    ['-0.0312499999999999999999999999', '00'],
  ])('rounds %s toward zero', (inputString, hexString) => {
    expectRoundedHexadecimal(inputString, RoundingMode.TowardZero, hexString);
  });

  it.each([
    ['1.28', '14'],
    ['0.1', '01'],
    ['-0.1', 'FE'],
    ['0.03125', '00'],
    ['-0.03125', 'FF'],
    ['0.09375', '01'],
    ['-0.09375', 'FE'],
    ['0.15625', '02'],
    ['-0.15625', 'FD'],
    ['0.21875', '03'],
    ['-0.21875', 'FC'],
    ['0.0312500000000000000000000001', '00'],
    ['-0.0312500000000000000000000001', 'FF'],
    ['0.0312499999999999999999999999', '00'],
    ['-0.0312499999999999999999999999', 'FF'],
  ])('rounds %s toward negative infinity', (inputString, hexString) => {
    expectRoundedHexadecimal(
      inputString,
      RoundingMode.TowardNegative,
      hexString,
    );
  });

  it.each([
    ['1.28', '15'],
    ['0.1', '02'],
    ['-0.1', 'FF'],
    ['0.03125', '01'],
    ['-0.03125', '00'],
    ['0.09375', '02'],
    ['-0.09375', 'FF'],
    ['0.15625', '03'],
    ['-0.15625', 'FE'],
    ['0.21875', '04'],
    ['-0.21875', 'FD'],
    ['0.0312500000000000000000000001', '01'],
    ['-0.0312500000000000000000000001', '00'],
    ['0.0312499999999999999999999999', '01'],
    ['-0.0312499999999999999999999999', '00'],
  ])('rounds %s toward positive infinity', (inputString, hexString) => {
    expectRoundedHexadecimal(
      inputString,
      RoundingMode.TowardPositive,
      hexString,
    );
  });

  it.each([
    [RoundingMode.TiesToEven, '', '00', '00000000'],
    [RoundingMode.TiesToEven, '-', '00', '00000000'],
    [RoundingMode.TiesToAway, '', '00', '00000000'],
    [RoundingMode.TiesToAway, '-', '00', '00000000'],
    [RoundingMode.TiesToPositive, '', '00', '00000000'],
    [RoundingMode.TiesToPositive, '-', '00', '00000000'],
    [RoundingMode.TowardZero, '', '00', '00000000'],
    [RoundingMode.TowardZero, '-', '00', '00000000'],
    [RoundingMode.TowardNegative, '', '00', '00000000'],
    [RoundingMode.TowardNegative, '-', 'FF', '11111111'],
    [RoundingMode.TowardPositive, '', '01', '00000001'],
    [RoundingMode.TowardPositive, '-', '00', '00000000'],
  ])('rounds an extremely small value in %s mode (sign "%s") to %s', (
    roundingMode, sign, hexString, binaryString,
  ) => {
    const inputString = `${sign}1e-999999999999999999999`;
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
      roundingMode,
    })).toEqual({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'rounded',
          value: hexString,
        },
        binary: {
          status: 'rounded',
          value: binaryString,
        },
        decimal: {
          status: 'original',
          value: inputString,
        },
      },
    });
  });

  /*
   * -7.96875 and 7.90625 are ties half a step inside the signed Q4.4 range,
   * so each mode shows its tie rule at the most negative and most positive
   * codes.
   */
  it.each([
    [RoundingMode.TiesToEven, '80', '7E'],
    [RoundingMode.TiesToAway, '80', '7F'],
    [RoundingMode.TiesToPositive, '81', '7F'],
    [RoundingMode.TowardZero, '81', '7E'],
    [RoundingMode.TowardNegative, '80', '7E'],
    [RoundingMode.TowardPositive, '81', '7F'],
  ])('rounds ties at the range edges in %s mode to %s and %s', (
    roundingMode, negativeHexString, positiveHexString,
  ) => {
    expectRoundedHexadecimal('-7.96875', roundingMode, negativeHexString);
    expectRoundedHexadecimal('7.90625', roundingMode, positiveHexString);
  });
});
