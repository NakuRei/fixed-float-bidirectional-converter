import { expect, it } from 'vitest';
import {
  InputFormat, OverflowMode, RoundingMode,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

it.each(([
  [
    '7.96875',
    RoundingMode.TowardZero,
    'rounded',
    '7F',
    '01111111',
    undefined,
    '7F',
    '01111111',
    undefined,
  ],
  [
    '7.96875',
    RoundingMode.TiesToEven,
    'rounded',
    '7F',
    '01111111',
    'saturated',
    '80',
    '10000000',
    'wrapped',
  ],
  [
    '-8.03125',
    RoundingMode.TiesToEven,
    'rounded',
    '80',
    '10000000',
    undefined,
    '80',
    '10000000',
    undefined,
  ],
  [
    '-8.03125',
    RoundingMode.TowardNegative,
    'rounded',
    '80',
    '10000000',
    'saturated',
    '7F',
    '01111111',
    'wrapped',
  ],
  [
    '1e999999999999999999999',
    RoundingMode.Exact,
    'exact',
    '7F',
    '01111111',
    'saturated',
    '00',
    '00000000',
    'wrapped',
  ],
  [
    '-1e999999999999999999999',
    RoundingMode.Exact,
    'exact',
    '80',
    '10000000',
    'saturated',
    '00',
    '00000000',
    'wrapped',
  ],
] as const).flatMap(([
  inputString,
  roundingMode,
  precision,
  satHex,
  satBits,
  satAction,
  wrapHex,
  wrapBits,
  wrapAction,
]) => [
  { inputString,
    roundingMode,
    precision,
    overflowMode: OverflowMode.Saturate,
    hexadecimal: satHex,
    binary: satBits,
    overflowAction: satAction },
  { inputString,
    roundingMode,
    precision,
    overflowMode: OverflowMode.Wrap,
    hexadecimal: wrapHex,
    binary: wrapBits,
    overflowAction: wrapAction },
]))('rounds $inputString with $roundingMode before $overflowMode', ({
  inputString, roundingMode, precision,
  overflowMode, hexadecimal, binary, overflowAction,
}) => {
  expect(convertFixedPoint({
    inputFormat: InputFormat.Decimal,
    inputString,
    isSigned: true,
    integerBitsString: '4',
    fractionalBitsString: '4',
    roundingMode,
    overflowMode,
  })).toEqual({
    status: 'success',
    ...overflowAction === undefined ? {} : { overflowAction },
    result: {
      hexadecimal: { status: precision,
        value: hexadecimal },
      binary: { status: precision,
        value: binary },
      decimal: { status: 'original',
        value: inputString },
    },
  });
});

it.each(Object.values(OverflowMode))('retains Exact checks with %s', (mode) => {
  for (const [inputString, errorCode] of [
    ['8.03', 'out-of-range'],
    ['-8.1', 'out-of-range'],
    ['7.95', 'inexact-value'],
  ]) {
    expect(convertFixedPoint({
      inputFormat: InputFormat.Decimal,
      inputString,
      isSigned: true,
      integerBitsString: '4',
      fractionalBitsString: '4',
      roundingMode: RoundingMode.Exact,
      overflowMode: mode,
    })).toEqual({
      status: 'invalid',
      diagnostic: {
        code: mode === OverflowMode.Error ? errorCode : 'inexact-value',
        fields: ['inputString'],
      },
    });
  }
});
