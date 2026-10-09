import { describe, expect, it } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
import { RoundingMode } from '../../src/conversion/RoundingMode';
import {
  convertFixedPoint,
  type ConversionInput,
} from '../../src/conversion/convertFixedPoint';

const validInput: ConversionInput = {
  inputString: '01001101',
  inputFormat: InputFormat.Binary,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
};

const decimalInput: ConversionInput = {
  inputString: '-3.1875',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.NearestEven,
};

describe('convertFixedPoint pasted input', () => {
  it.each([
    [InputFormat.Binary, '0b01001101'],
    [InputFormat.Binary, '0B01001101'],
    [InputFormat.Binary, ' 01001101\n'],
    [InputFormat.Binary, '\t0b01001101 '],
    [InputFormat.Hexadecimal, '0x4D'],
    [InputFormat.Hexadecimal, '0X4d'],
    [InputFormat.Hexadecimal, ' 4D\r\n'],
  ] as const)('accepts %s pattern %j', (inputFormat, inputString) => {
    const originalValue = inputString.trim();
    expect(convertFixedPoint({
      ...validInput,
      inputFormat,
      inputString,
    })).toEqual({
      status: 'success',
      result: {
        binary: inputFormat === InputFormat.Binary
          ? {
            status: 'original',
            value: originalValue,
          }
          : {
            status: 'exact',
            value: '01001101',
          },
        hex: inputFormat === InputFormat.Hexadecimal
          ? {
            status: 'original',
            value: originalValue,
          }
          : {
            status: 'exact',
            value: '4D',
          },
        decimal: {
          status: 'exact',
          value: '4.8125',
        },
      },
    });
  });

  it('reads a leading 0b in hex input as hex digits', () => {
    expect(convertFixedPoint({
      ...validInput,
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

  it.each([
    ['0x4D', validInput, /Select Hexadecimal/u],
    ['0X4d', validInput, /Select Hexadecimal/u],
    ['0x10', decimalInput, /Select Hexadecimal/u],
    ['0b10', decimalInput, /Select Binary/u],
    [' 0B10 ', decimalInput, /Select Binary/u],
  ] as const)('points %j to the format its prefix denotes', (
    inputString, input, message,
  ) => {
    const outcome = convertFixedPoint({
      ...input,
      inputString,
    });
    expect(outcome).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
    });
    if (outcome.status === 'invalid') {
      expect(outcome.message).toMatch(message);
    }
  });

  it.each([
    [InputFormat.Binary, '0b'],
    [InputFormat.Hexadecimal, '0x'],
  ] as const)('rejects %s prefix %s without digits', (
    inputFormat, inputString,
  ) => {
    const outcome = convertFixedPoint({
      ...validInput,
      inputFormat,
      inputString,
    });
    expect(outcome).toMatchObject({
      status: 'invalid',
      invalidFields: ['inputString'],
    });
    if (outcome.status === 'invalid') {
      expect(outcome.message).toMatch(/digit count should be \d+, but got 0/u);
    }
  });

  it.each([InputFormat.Binary, InputFormat.Hexadecimal])(
    'returns empty for whitespace-only %s input',
    (inputFormat) => {
      expect(convertFixedPoint({
        ...validInput,
        inputFormat,
        inputString: ' \n\t',
      })).toEqual({ status: 'empty' });
    },
  );

  it('returns empty for whitespace-only decimal input', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: ' \n\t',
    })).toEqual({ status: 'empty' });
  });

  it.each([' -3.1875', '-3.1875 ', '\n-3.1875', '-3.1875\r\n'])(
    'accepts decimal input %j surrounded by whitespace',
    (inputString) => {
      expect(convertFixedPoint({
        ...decimalInput,
        inputString,
      })).toEqual({
        status: 'success',
        result: {
          hex: {
            status: 'exact',
            value: 'CD',
          },
          binary: {
            status: 'exact',
            value: '11001101',
          },
          decimal: {
            status: 'original',
            value: '-3.1875',
          },
        },
      });
    },
  );
});
