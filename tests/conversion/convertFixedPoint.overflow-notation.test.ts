import { describe, expect, it } from 'vitest';
import { InputFormat, OverflowMode } from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

describe('overflow input interpretation', () => {
  it.each(([
    [InputFormat.Hexadecimal, '800'],
    [InputFormat.Binary, '100000000000'],
  ] as const).flatMap(([inputFormat, inputString]) => ([
    [OverflowMode.Saturate, 'saturated', 'FF', '11111111', '15.9375'],
    [OverflowMode.Wrap, 'wrapped', '00', '00000000', '0'],
  ] as const).map(([
    overflowMode,
    overflowAction,
    hexadecimal,
    binary,
    decimal,
  ]) => ({
    inputFormat,
    inputString,
    overflowMode,
    overflowAction,
    hexadecimal,
    binary,
    decimal,
  }))))('reads unsigned high-bit $inputString with $overflowMode', ({
    inputFormat, inputString, overflowMode, overflowAction,
    hexadecimal, binary, decimal,
  }) => {
    expect(convertFixedPoint({
      inputFormat,
      inputString,
      overflowMode,
      isSigned: false,
      integerBitsString: '4',
      fractionalBitsString: '4',
    })).toEqual({
      status: 'success',
      overflowAction,
      result: {
        hexadecimal: {
          status: 'exact',
          value: hexadecimal,
        },
        binary: {
          status: 'exact',
          value: binary,
        },
        decimal: {
          status: 'exact',
          value: decimal,
        },
        [inputFormat]: {
          status: 'original',
          value: inputString,
        },
      },
    });
  });

  it.each(([
    [InputFormat.Binary, '1000000', 8, 7],
    [InputFormat.Binary, '0b', 8, 0],
    [InputFormat.Hexadecimal, 'F', 2, 1],
    [InputFormat.Hexadecimal, '0x', 2, 0],
  ] as const).flatMap(([
    inputFormat,
    inputString,
    expected,
    actual,
  ]) => Object.values(OverflowMode).map((overflowMode) => ({
    inputFormat,
    inputString,
    expected,
    actual,
    overflowMode,
  }))))('rejects short $inputString with $overflowMode', ({
    inputFormat, inputString, expected, actual, overflowMode,
  }) => {
    expect(convertFixedPoint({
      inputFormat,
      inputString,
      overflowMode,
      isSigned: true,
      integerBitsString: '4',
      fractionalBitsString: '4',
    })).toEqual({
      status: 'invalid',
      diagnostic: {
        code: 'digit-count-mismatch',
        requirement: overflowMode === OverflowMode.Error ? 'exact' : 'minimum',
        inputFormat,
        expected,
        actual,
        fields: ['inputString'],
      },
    });
  });

  it.each([
    [InputFormat.Binary, '000000001', 8, 9],
    [InputFormat.Binary, '0000000001', 8, 10],
    [InputFormat.Binary, '0b111111111', 8, 9],
    [InputFormat.Hexadecimal, '0x0FF', 2, 3],
  ] as const)('preserves Error digit limit for %s %s', (
    inputFormat, inputString, expected, actual,
  ) => {
    expect(convertFixedPoint({
      inputFormat,
      inputString,
      overflowMode: OverflowMode.Error,
      isSigned: true,
      integerBitsString: '4',
      fractionalBitsString: '4',
    })).toEqual({
      status: 'invalid',
      diagnostic: {
        code: 'digit-count-mismatch',
        requirement: 'exact',
        inputFormat,
        expected,
        actual,
        fields: ['inputString'],
      },
    });
  });

  it.each(([
    ['3F', 3, 3, true, '111111', '-0.125'],
    ['0x3F', 3, 3, true, '111111', '-0.125'],
    ['FF', 3, 3, true, '111111', '-0.125'],
    ['20', 3, 3, true, '100000', '-4'],
    ['E0', 3, 3, true, '100000', '-4'],
    ['1F', 5, 0, true, '11111', '-1'],
    ['1', 1, 0, true, '1', '-1'],
    ['F', 1, 0, true, '1', '-1'],
    ['3F', 3, 3, false, '111111', '7.875'],
    ['1F', 3, 3, true, '011111', '3.875'],
  ] as const).flatMap(([
    inputString,
    integerBits,
    fractionalBits,
    isSigned,
    binary,
    decimal,
  ]) => Object.values(OverflowMode).map((overflowMode) => ({
    inputString,
    integerBits,
    fractionalBits,
    isSigned,
    binary,
    decimal,
    overflowMode,
  }))))('preserves padded $inputString in $overflowMode signed=$isSigned', ({
    inputString, integerBits, fractionalBits, isSigned,
    binary, decimal, overflowMode,
  }) => {
    expect(convertFixedPoint({
      inputFormat: InputFormat.Hexadecimal,
      inputString,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
      isSigned,
      overflowMode,
    })).toEqual({
      status: 'success',
      result: {
        hexadecimal: { status: 'original',
          value: inputString },
        binary: { status: 'exact',
          value: binary },
        decimal: { status: 'exact',
          value: decimal },
      },
    });
  });

  it.each(([
    ['03F', 3, 3, true, '011111', '3.875', '111111', '-0.125'],
    ['DF', 3, 3, true, '100000', '-4', '011111', '3.875'],
    ['FDF', 3, 3, true, '100000', '-4', '011111', '3.875'],
    ['FF', 3, 3, false, '111111', '7.875', '111111', '7.875'],
    ['FF', 7, 0, false, '1111111', '127', '1111111', '127'],
    ['F', 0, 1, false, '1', '0.5', '1', '0.5'],
    ['AB', 3, 2, false, '11111', '7.75', '01011', '2.75'],
  ] as const).flatMap(([
    inputString,
    integerBits,
    fractionalBits,
    isSigned,
    saturatedBits,
    saturatedValue,
    wrappedBits,
    wrappedValue,
  ]) => [
    { inputString,
      integerBits,
      fractionalBits,
      isSigned,
      overflowMode: OverflowMode.Saturate,
      overflowAction: 'saturated',
      binary: saturatedBits,
      decimal: saturatedValue },
    { inputString,
      integerBits,
      fractionalBits,
      isSigned,
      overflowMode: OverflowMode.Wrap,
      overflowAction: 'wrapped',
      binary: wrappedBits,
      decimal: wrappedValue },
  ]))('$overflowMode $inputString signed=$isSigned', ({
    inputString, integerBits, fractionalBits, isSigned,
    overflowMode, overflowAction, binary, decimal,
  }) => {
    expect(convertFixedPoint({
      inputFormat: InputFormat.Hexadecimal,
      inputString,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
      isSigned,
      overflowMode,
    })).toEqual({
      status: 'success',
      overflowAction,
      result: {
        hexadecimal: { status: 'original',
          value: inputString },
        binary: { status: 'exact',
          value: binary },
        decimal: { status: 'exact',
          value: decimal },
      },
    });
  });
});
