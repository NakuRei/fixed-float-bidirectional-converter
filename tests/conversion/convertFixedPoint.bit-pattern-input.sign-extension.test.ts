import { describe, it, expect } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
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
    ['111111', 'FF', '3F', 3, 3, false, '7.875'],
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
    for (const [inputFormat, inputString] of [
      [InputFormat.Binary, binaryString],
      [InputFormat.Hexadecimal, inputHexString],
      [InputFormat.Hexadecimal, hexString],
    ] as const) {
      expect(convertFixedPoint({
        inputString,
        inputFormat,
        isSigned,
        integerBitsString: integerBits.toString(),
        fractionalBitsString: fractionalBits.toString(),
      })).toEqual({
        status: 'success',
        result: {
          inputFormat,
          inputString,
          fixedPoint: {
            status: 'exact',
            hexadecimal: hexString,
            binary: binaryString,
          },
          float64: {
            status: 'exact',
            value: float64Value,
          },
        },
      });
    }
  });

  it.each([
    ['4d', 4, 4, true, '01001101', '4D', '4.8125'],
    ['cd', 4, 4, true, '11001101', 'CD', '-3.1875'],
    ['cd', 4, 4, false, '11001101', 'CD', '12.8125'],
    ['FF', 3, 3, false, '111111', '3F', '7.875'],
    ['FF', 3, 3, true, '111111', 'FF', '-0.125'],
    ['ff', 3, 3, false, '111111', '3F', '7.875'],
    ['ff', 3, 3, true, '111111', 'FF', '-0.125'],
    ['3F', 3, 3, true, '111111', 'FF', '-0.125'],
    ['DF', 3, 3, true, '011111', '1F', '3.875'],
    ['E0', 3, 3, true, '100000', 'E0', '-4'],
    ['E0', 3, 3, false, '100000', '20', '4'],
    ['F', 1, 1, false, '11', '3', '1.5'],
    ['AB', 3, 2, false, '01011', '0B', '2.75'],
    ['00f', 8, 4, false, '000000001111', '00F', '0.9375'],
  ])('extends hexadecimal %s for %i.%i signed=%s', (
    inputString,
    integerBits,
    fractionalBits,
    isSigned,
    binaryString,
    hexString,
    float64Value,
  ) => {
    expect(convertFixedPoint({
      inputString,
      inputFormat: InputFormat.Hexadecimal,
      isSigned,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
    })).toEqual({
      status: 'success',
      result: {
        inputFormat: InputFormat.Hexadecimal,
        inputString,
        fixedPoint: {
          status: 'exact',
          hexadecimal: hexString,
          binary: binaryString,
        },
        float64: {
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
      inputString,
      inputFormat: InputFormat.Binary,
      isSigned,
      integerBitsString: inputString.length.toString(),
      fractionalBitsString: '0',
    })).toMatchObject({
      status: 'success',
      result: {
        inputFormat: InputFormat.Binary,
        inputString,
        fixedPoint: {
          status: 'exact',
          hexadecimal: hexString,
          binary: inputString,
        },
      },
    });
  });
});
