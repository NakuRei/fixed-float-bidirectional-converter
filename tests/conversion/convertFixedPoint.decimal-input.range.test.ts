import { describe, expect, it } from 'vitest';
import {
  InputFormat,
  RoundingMode,
  type ConversionInput,
  type RoundingModeType,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

const decimalInput = {
  inputString: '0',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.TiesToEven,
} satisfies ConversionInput;

const outOfRange = {
  status: 'invalid',
  diagnostic: {
    code: 'out-of-range',
    fields: ['inputString'],
  },
} as const;

const inexact = {
  status: 'invalid',
  diagnostic: {
    code: 'inexact-value',
    fields: ['inputString'],
  },
} as const;

/*
 * Each input lies less than one step outside the range, so every mode but the
 * one rounding outward brings it to the nearest representable value.
 */
const nearRangeInputs = [
  {
    inputString: '7.95',
    hexadecimal: '7F',
    outwardMode: RoundingMode.TowardPositive,
  },
  {
    inputString: '7.93750000000000000001',
    hexadecimal: '7F',
    outwardMode: RoundingMode.TowardPositive,
  },
  {
    inputString: '-8.00000000000000000001',
    hexadecimal: '80',
    outwardMode: RoundingMode.TowardNegative,
  },
  {
    inputString: '15.93750000000000000001',
    format: { isSigned: false },
    hexadecimal: 'FF',
    outwardMode: RoundingMode.TowardPositive,
  },
  {
    inputString: '-0.00000000000000000001',
    format: { isSigned: false },
    hexadecimal: '00',
    outwardMode: RoundingMode.TowardNegative,
  },
  {
    inputString: '-1e-999999999999999999999',
    format: { isSigned: false },
    hexadecimal: '00',
    outwardMode: RoundingMode.TowardNegative,
  },
  {
    inputString: '1e-999999999999999999999',
    format: {
      integerBitsString: '0',
      fractionalBitsString: '1',
    },
    hexadecimal: '0',
    outwardMode: RoundingMode.TowardPositive,
  },
];

function convertNearRangeInput(
  input: (typeof nearRangeInputs)[number],
  roundingMode: RoundingModeType,
): ReturnType<typeof convertFixedPoint> {
  return convertFixedPoint({
    ...decimalInput,
    ...input.format,
    inputString: input.inputString,
    roundingMode,
  });
}

describe('convertFixedPoint decimal input range', () => {
  it.each(nearRangeInputs)(
    'rounds $inputString to $hexadecimal in every mode '
    + 'but $outwardMode and exact',
    (input) => {
      const inwardModes = Object.values(RoundingMode).filter((mode) => {
        return mode !== input.outwardMode && mode !== RoundingMode.Exact;
      });
      for (const roundingMode of inwardModes) {
        expect(convertNearRangeInput(input, roundingMode)).toMatchObject({
          status: 'success',
          result: {
            hexadecimal: {
              status: 'rounded',
              value: input.hexadecimal,
            },
          },
        });
      }
    },
  );

  it.each(nearRangeInputs)('rejects $inputString rounded $outwardMode', (
    input,
  ) => {
    expect(convertNearRangeInput(input, input.outwardMode)).toEqual(outOfRange);
  });

  it.each(nearRangeInputs)('reports $inputString as inexact in exact mode', (
    input,
  ) => {
    expect(convertNearRangeInput(input, RoundingMode.Exact)).toEqual(inexact);
  });

  /*
   * More than half a step outside the range, only the directed modes pointing
   * inward fit; on a tie, the even code decides, and 127 is odd while -128 is
   * even.
   */
  const splitInputs: readonly {
    inputString: string;
    hexadecimal: string;
    inwardModes: readonly RoundingModeType[];
  }[] = [
    {
      inputString: '7.97',
      hexadecimal: '7F',
      inwardModes: [RoundingMode.TowardZero, RoundingMode.TowardNegative],
    },
    {
      inputString: '7.96875',
      hexadecimal: '7F',
      inwardModes: [RoundingMode.TowardZero, RoundingMode.TowardNegative],
    },
    {
      inputString: '-8.03125',
      hexadecimal: '80',
      inwardModes: [
        RoundingMode.TiesToEven,
        RoundingMode.TiesToPositive,
        RoundingMode.TowardZero,
        RoundingMode.TowardPositive,
      ],
    },
  ];

  it.each(splitInputs)('rounds $inputString to $hexadecimal in $inwardModes', (
    { inputString, hexadecimal, inwardModes },
  ) => {
    for (const roundingMode of inwardModes) {
      expect(convertFixedPoint({
        ...decimalInput,
        inputString,
        roundingMode,
      })).toMatchObject({
        status: 'success',
        result: {
          hexadecimal: {
            status: 'rounded',
            value: hexadecimal,
          },
        },
      });
    }
  });

  it.each(splitInputs)('rejects $inputString in every other rounding mode', (
    { inputString, inwardModes },
  ) => {
    const outwardModes = Object.values(RoundingMode).filter((mode) => {
      return !inwardModes.includes(mode) && mode !== RoundingMode.Exact;
    });
    for (const roundingMode of outwardModes) {
      expect(convertFixedPoint({
        ...decimalInput,
        inputString,
        roundingMode,
      })).toEqual(outOfRange);
    }
  });

  it.each(splitInputs)('reports $inputString as inexact in exact mode', (
    { inputString },
  ) => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString,
      roundingMode: RoundingMode.Exact,
    })).toEqual(inexact);
  });

  it.each([
    ['8', true],
    ['8.03', true],
    ['-8.0625', true],
    ['16', false],
    ['-1', false],
    ['0.5', true, '0', '1'],
    ['1e999999999999999999999', true],
  ])('rejects %s in every mode, signed=%s', (
    inputString, isSigned, integerBitsString = '4', fractionalBitsString = '4',
  ) => {
    for (const roundingMode of Object.values(RoundingMode)) {
      expect(convertFixedPoint({
        ...decimalInput,
        inputString,
        isSigned,
        integerBitsString,
        fractionalBitsString,
        roundingMode,
      })).toEqual(outOfRange);
    }
  });
});
