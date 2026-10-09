import { describe, it, expect } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

describe('convertFixedPoint', () => {
  it.each([
    ['01010', 5, 0, '10'],
    ['11010', 5, 0, '-6'],
    ['01010100', 5, 3, '10.5'],
    ['0110101', 3, 4, '3.3125'],
    ['01101', 4, 1, '6.5'],
    ['10101100', 5, 3, '-10.5'],
    ['1001011', 3, 4, '-3.3125'],
    ['10011', 4, 1, '-6.5'],
    ['10000', 5, 0, '-16'],
    ['01111', 5, 0, '15'],
    ['10000000', 5, 3, '-16'],
    ['01111111', 5, 3, '15.875'],
    ['01', 1, 1, '0.5'],
    ['11', 1, 1, '-0.5'],
    ['001', 2, 1, '0.5'],
    ['101', 2, 1, '-1.5'],
    ['0001', 1, 3, '0.125'],
    ['1111', 1, 3, '-0.125'],
    ['00000', 5, 0, '0'],
    ['11111', 5, 0, '-1'],
    ['1111111', 3, 4, '-0.0625'],
    ['100000', 6, 0, '-32'],
    ['10000000', 3, 5, '-4'],
    ['010', 1, 2, '0.5'],
    ['110', 1, 2, '-0.5'],
    ['011', 1, 2, '0.75'],
    ['111', 1, 2, '-0.25'],
    ['0101', 0, 4, '0.3125'],
    ['1011', 0, 4, '-0.3125'],
    ['01000000000000000000000000000000', 32, 0, '1073741824'],
    ['11000000000000000000000000000000', 32, 0, '-1073741824'],
    ['000000000001', 0, 12, '0.000244140625'],
    ['100000000001', 1, 11, '-0.99951171875'],
  ])('decodes signed %s with %i integer and %i fractional bits', (
    inputString,
    integerBits,
    fractionalBits,
    float64Value,
  ) => {
    expect(convertFixedPoint({
      inputString,
      inputFormat: InputFormat.Binary,
      isSigned: true,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
    })).toMatchObject({
      status: 'success',
      result: {
        binary: {
          status: 'original',
          value: inputString,
        },
        decimal: {
          status: 'exact',
          value: float64Value,
        },
      },
    });
  });

  it.each([
    ['0000', 8, 8, '0'],
    ['FF', 8, 0, '255'],
    ['00FF', 0, 16, '0.0038909912109375'],
    ['1A3F', 8, 8, '26.24609375'],
    ['1234', 12, 4, '291.25'],
    ['FFFF', 8, 8, '255.99609375'],
    ['0001', 8, 8, '0.00390625'],
    ['0080', 8, 8, '0.5'],
    ['ff', 8, 0, '255'],
    ['A', 4, 0, '10'],
    ['A', 3, 1, '5'],
    ['A', 2, 2, '2.5'],
    ['FF', 3, 3, '7.875'],
    ['FEDCBA9876543210', 32, 32, '4275878552.462222'],
  ])('decodes unsigned hexadecimal %s with %i integer and %i fractional bits', (
    inputString,
    integerBits,
    fractionalBits,
    float64Value,
  ) => {
    expect(convertFixedPoint({
      inputString,
      inputFormat: InputFormat.Hexadecimal,
      isSigned: false,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
    })).toMatchObject({
      status: 'success',
      result: {
        decimal: { value: float64Value },
      },
    });
  });

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
          binary: {
            status: inputFormat === InputFormat.Binary ? 'original' : 'exact',
            value: binaryString,
          },
          hexadecimal: {
            status: inputFormat === InputFormat.Hexadecimal
              ? 'original'
              : 'exact',
            value: inputFormat === InputFormat.Hexadecimal
              ? inputString
              : hexString,
          },
          decimal: {
            status: 'exact',
            value: float64Value,
          },
        },
      });
    }
  });

  it.each([
    ['4d', 4, 4, true, '01001101', '4.8125'],
    ['cd', 4, 4, true, '11001101', '-3.1875'],
    ['cd', 4, 4, false, '11001101', '12.8125'],
    ['FF', 3, 3, false, '111111', '7.875'],
    ['FF', 3, 3, true, '111111', '-0.125'],
    ['ff', 3, 3, false, '111111', '7.875'],
    ['ff', 3, 3, true, '111111', '-0.125'],
    ['3F', 3, 3, true, '111111', '-0.125'],
    ['DF', 3, 3, true, '011111', '3.875'],
    ['E0', 3, 3, true, '100000', '-4'],
    ['E0', 3, 3, false, '100000', '4'],
    ['F', 1, 1, false, '11', '1.5'],
    ['AB', 3, 2, false, '01011', '2.75'],
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
      inputString,
      inputFormat: InputFormat.Hexadecimal,
      isSigned,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
    })).toEqual({
      status: 'success',
      result: {
        binary: {
          status: 'exact',
          value: binaryString,
        },
        hexadecimal: {
          status: 'original',
          value: inputString,
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
      inputString,
      inputFormat: InputFormat.Binary,
      isSigned,
      integerBitsString: inputString.length.toString(),
      fractionalBitsString: '0',
    })).toMatchObject({
      status: 'success',
      result: {
        binary: {
          status: 'original',
          value: inputString,
        },
        hexadecimal: {
          status: 'exact',
          value: hexString,
        },
      },
    });
  });

  it.each([
    ['F'.repeat(64), 256, 0, false, (2 ** 256).toString()],
    [`${'0'.repeat(63)}1`, 0, 256, false, (2 ** -256).toString()],
    ['F'.repeat(64), 256, 0, true, '-1'],
    [`8${'0'.repeat(63)}`, 256, 0, true, (-(2 ** 255)).toString()],
  ])('decodes wide hexadecimal %s with %i integer and %i fractional bits', (
    inputString,
    integerBits,
    fractionalBits,
    isSigned,
    float64Value,
  ) => {
    expect(convertFixedPoint({
      inputString,
      inputFormat: InputFormat.Hexadecimal,
      isSigned,
      integerBitsString: integerBits.toString(),
      fractionalBitsString: fractionalBits.toString(),
    })).toMatchObject({
      status: 'success',
      result: {
        decimal: { value: float64Value },
      },
    });
  });
});
