import { describe, expect, it } from 'vitest';
import {
  InputFormat,
  OverflowMode,
  RoundingMode,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

const format = {
  integerBitsString: '4',
  fractionalBitsString: '4',
  isSigned: true,
};

describe('overflow boundaries', () => {
  it.each(([
    [-513, -128, -1, 0, 255],
    [-257, -128, -1, 0, 255],
    [-129, -128, 127, 0, 127],
    [-128, -128, -128, 0, 128],
    [-1, -1, -1, 0, 255],
    [0, 0, 0, 0, 0],
    [127, 127, 127, 127, 127],
    [128, 127, -128, 128, 128],
    [255, 127, -1, 255, 255],
    [256, 127, 0, 255, 0],
    [513, 127, 1, 255, 1],
  ] as const).flatMap(([
    integer,
    signedSaturated,
    signedWrapped,
    unsignedSaturated,
    unsignedWrapped,
  ]) => ([
    [true, OverflowMode.Saturate, signedSaturated, 'saturated'],
    [true, OverflowMode.Wrap, signedWrapped, 'wrapped'],
    [false, OverflowMode.Saturate, unsignedSaturated, 'saturated'],
    [false, OverflowMode.Wrap, unsignedWrapped, 'wrapped'],
  ] as const).flatMap(([
    isSigned,
    overflowMode,
    expected,
    action,
  ]) => {
    const pattern = integer < 0 ? integer + 4096 : integer;
    return [
      [InputFormat.Decimal, (integer / 16).toString()] as const,
      ...isSigned || integer >= 0
        ? [
          [InputFormat.Binary, pattern.toString(2).padStart(12, '0')] as const,
          [
            InputFormat.Hexadecimal,
            pattern.toString(16).padStart(3, '0'),
          ] as const,
        ]
        : [],
    ].map(([inputFormat, inputString]) => ({
      integer,
      isSigned,
      overflowMode,
      expected,
      action,
      inputFormat,
      inputString,
    }));
  })))('$overflowMode $integer signed=$isSigned from $inputFormat', ({
    integer, isSigned, overflowMode, expected, action, inputFormat, inputString,
  }) => {
    const bits = expected < 0 ? expected + 256 : expected;
    const input = { ...format,
      isSigned,
      overflowMode,
      inputString };
    const outcome = inputFormat === InputFormat.Decimal
      ? convertFixedPoint({ ...input,
        inputFormat,
        roundingMode: RoundingMode.Exact })
      : convertFixedPoint({ ...input,
        inputFormat });
    expect(outcome).toEqual({
      status: 'success',
      ...integer === expected ? {} : { overflowAction: action },
      result: {
        binary: {
          status: 'exact',
          value: bits.toString(2).padStart(8, '0'),
        },
        hexadecimal: {
          status: 'exact',
          value: bits.toString(16).padStart(2, '0')
            .toUpperCase(),
        },
        decimal: {
          status: 'exact',
          value: (expected / 16).toString(),
        },
        [inputFormat]: { status: 'original',
          value: inputString },
      },
    });
  });
});
