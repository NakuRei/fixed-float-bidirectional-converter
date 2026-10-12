import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

describe('convertFixedPoint Float64 output values', () => {
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
