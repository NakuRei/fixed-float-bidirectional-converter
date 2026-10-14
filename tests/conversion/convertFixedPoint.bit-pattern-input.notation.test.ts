import { describe, it, expect } from 'vitest';
import {
  InputFormat,
  type ConversionDiagnostic,
  type ConversionInput,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

const bitPatternInput = {
  inputString: '01001101',
  inputFormat: InputFormat.Binary,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
} satisfies ConversionInput;

function expectInvalidConversion(
  input: ConversionInput,
  diagnostic: ConversionDiagnostic,
): void {
  expect(convertFixedPoint(input)).toEqual({
    status: 'invalid',
    diagnostic,
  });
}

describe('convertFixedPoint bit pattern input notation', () => {
  it.each([
    ['0b01001101', '0b01001101'],
    ['0B01001101', '0B01001101'],
    [' 01001101\n', '01001101'],
    ['\t0b01001101 ', '0b01001101'],
  ])('accepts binary pattern %j as original %j', (inputString, original) => {
    expect(convertFixedPoint({
      ...bitPatternInput,
      inputFormat: InputFormat.Binary,
      inputString,
    })).toEqual({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'exact',
          value: '4D',
        },
        binary: {
          status: 'original',
          value: original,
        },
        decimal: {
          status: 'exact',
          value: '4.8125',
        },
      },
    });
  });

  it.each([
    ['0x4D', '0x4D'],
    ['0X4d', '0X4d'],
    [' 4D\r\n', '4D'],
  ])('accepts hexadecimal pattern %j as original %j', (
    inputString, original,
  ) => {
    expect(convertFixedPoint({
      ...bitPatternInput,
      inputFormat: InputFormat.Hexadecimal,
      inputString,
    })).toEqual({
      status: 'success',
      result: {
        hexadecimal: {
          status: 'original',
          value: original,
        },
        binary: {
          status: 'exact',
          value: '01001101',
        },
        decimal: {
          status: 'exact',
          value: '4.8125',
        },
      },
    });
  });

  it('reads a leading 0b in hexadecimal input as hexadecimal digits', () => {
    expect(convertFixedPoint({
      ...bitPatternInput,
      inputFormat: InputFormat.Hexadecimal,
      inputString: '0b',
      isSigned: false,
    })).toMatchObject({
      status: 'success',
      result: {
        binary: {
          status: 'exact',
          value: '00001011',
        },
      },
    });
  });

  it.each([InputFormat.Binary, InputFormat.Hexadecimal])(
    'returns empty for whitespace-only %s input',
    (inputFormat) => {
      expect(convertFixedPoint({
        ...bitPatternInput,
        inputFormat,
        inputString: ' \n\t',
      })).toEqual({ status: 'empty' });
    },
  );

  it.each(['invalid', '01a01', '01001102', '0100 1101', '0b0b0b0b'])(
    'rejects invalid binary characters in %s',
    (inputString) => {
      expectInvalidConversion({
        ...bitPatternInput,
        inputString,
      }, {
        code: 'invalid-characters',
        inputFormat: InputFormat.Binary,
        fields: ['inputString'],
      });
    },
  );

  it.each(['GG', '-1', '4 D', '0x0x4D'])(
    'rejects invalid hexadecimal characters in %s',
    (inputString) => {
      expectInvalidConversion({
        ...bitPatternInput,
        inputString,
        inputFormat: InputFormat.Hexadecimal,
      }, {
        code: 'invalid-characters',
        inputFormat: InputFormat.Hexadecimal,
        fields: ['inputString'],
      });
    },
  );

  it.each([
    [InputFormat.Binary, '0100110', 8, 7],
    [InputFormat.Binary, '001001101', 8, 9],
    [InputFormat.Hexadecimal, 'F', 2, 1],
    [InputFormat.Hexadecimal, '0FF', 2, 3],
    [InputFormat.Binary, '0b', 8, 0],
    [InputFormat.Hexadecimal, '0x', 2, 0],
  ] as const)('rejects %s length of %j', (
    inputFormat, inputString, expected, actual,
  ) => {
    expectInvalidConversion({
      ...bitPatternInput,
      inputFormat,
      inputString,
    }, {
      code: 'digit-count-mismatch',
      inputFormat,
      expected,
      actual,
      fields: ['inputString'],
    });
  });

  it.each(['0x4D', '0X4d'])(
    'points %j to the format its prefix denotes',
    (inputString) => {
      expectInvalidConversion({
        ...bitPatternInput,
        inputString,
      }, {
        code: 'foreign-prefix',
        prefixFormat: InputFormat.Hexadecimal,
        fields: ['inputString'],
      });
    },
  );
});
