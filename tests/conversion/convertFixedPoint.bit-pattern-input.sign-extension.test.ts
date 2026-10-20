import { describe, it, expect } from 'vitest';
import { OverflowMode, InputFormat } from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

describe('convertFixedPoint bit pattern input sign extension', () => {
  it.each([
    ['0', '0', '0', 1, 0, true, '0'],
    ['1', '1', 'F', 1, 0, true, '-1'],
    ['1', '1', '1', 1, 0, false, '1'],
    ['1', '1', 'F', 0, 1, true, '-0.5'],
    ['1', '1', '1', 0, 1, false, '0.5'],
    ['00000001', '01', '01', 4, 4, false, '0.0625'],
    ['111111', '3F', 'FF', 3, 3, true, '-0.125'],
    ['111111', '3f', '3F', 3, 3, false, '7.875'],
    ['11001101', 'CD', 'CD', 4, 4, true, '-3.1875'],
  ])('agrees for %s / %s / %s with %i.%i signed=%s', (
    binaryString,
    inputHexString,
    hexString,
    integerBits,
    fractionalBits,
    isSigned,
    float64Value,
  ) => {
    const exactBinary = {
      status: 'exact',
      value: binaryString,
    } as const;
    for (const [inputFormat, inputString, hexadecimal, binary] of [
      [
        InputFormat.Binary,
        binaryString,
        {
          status: 'exact',
          value: hexString,
        },
        {
          status: 'original',
          value: binaryString,
        },
      ],
      [
        InputFormat.Hexadecimal,
        inputHexString,
        {
          status: 'original',
          value: inputHexString,
        },
        exactBinary,
      ],
      [
        InputFormat.Hexadecimal,
        hexString,
        {
          status: 'original',
          value: hexString,
        },
        exactBinary,
      ],
    ] as const) {
      expect(convertFixedPoint({
        overflowMode: OverflowMode.Error,
        inputString,
        inputFormat,
        isSigned,
        integerBitsString: integerBits.toString(),
        fractionalBitsString: fractionalBits.toString(),
      })).toEqual({
        status: 'success',
        result: {
          hexadecimal,
          binary,
          decimal: {
            status: 'exact',
            value: float64Value,
          },
        },
      });
    }
  });

  it.each([
    ['DF', 3, 3, true],
    ['FF', 3, 3, false],
    ['ff', 3, 3, false],
    ['E0', 3, 3, false],
    ['F', 1, 1, false],
    ['AB', 3, 2, false],
  ] as const)('rejects excess value bits in %s for %i.%i signed=%s', (
    inputString, integerBits, fractionalBits, isSigned,
  ) => {
    expect(convertFixedPoint({
      overflowMode: OverflowMode.Error,
      inputString,
      inputFormat: InputFormat.Hexadecimal,
      isSigned,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
    })).toEqual({
      status: 'invalid',
      diagnostic: {
        code: 'out-of-range',
        fields: ['inputString'],
      },
    });
  });

  it.each([
    ['4d', 4, 4, true, '01001101', '4.8125'],
    ['cd', 4, 4, true, '11001101', '-3.1875'],
    ['cd', 4, 4, false, '11001101', '12.8125'],
    ['FF', 3, 3, true, '111111', '-0.125'],
    ['ff', 3, 3, true, '111111', '-0.125'],
    ['3F', 3, 3, true, '111111', '-0.125'],
    ['E0', 3, 3, true, '100000', '-4'],
    ['00f', 8, 4, false, '000000001111', '0.9375'],
  ])('extends hexadecimal %s for %i.%i signed=%s', (
    inputString,
    integerBits,
    fractionalBits,
    isSigned,
    binaryString,
    float64Value,
  ) => {
    expect(convertFixedPoint({
      overflowMode: OverflowMode.Error,
      inputString,
      inputFormat: InputFormat.Hexadecimal,
      isSigned,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
    })).toEqual({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'original',
          value: inputString,
        },
        binary: {
          status: 'exact',
          value: binaryString,
        },
        decimal: {
          status: 'exact',
          value: float64Value,
        },
      },
    });
  });

  it.each([
    ['11110000111100001111000011110000', false, 'F0F0F0F0'],
    ['0001010', false, '0A'],
    ['111111', true, 'FF'],
    ['111111', false, '3F'],
    ['100000', true, 'E0'],
    ['100000', false, '20'],
    ['011111', true, '1F'],
    ['000000', true, '00'],
    [`1${'0'.repeat(53)}`, true, 'E0000000000000'],
    [`1${'0'.repeat(53)}`, false, '20000000000000'],
    ['1'.repeat(65), true, 'F'.repeat(17)],
    ['1'.repeat(65), false, `1${'F'.repeat(16)}`],
  ])('extends binary %s for signed=%s', (
    inputString,
    isSigned,
    hexString,
  ) => {
    expect(convertFixedPoint({
      overflowMode: OverflowMode.Error,
      inputString,
      inputFormat: InputFormat.Binary,
      isSigned,
      integerBitsString: inputString.length.toString(),
      fractionalBitsString: '0',
    })).toMatchObject({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'exact',
          value: hexString,
        },
        binary: {
          status: 'original',
          value: inputString,
        },
      },
    });
  });
});
