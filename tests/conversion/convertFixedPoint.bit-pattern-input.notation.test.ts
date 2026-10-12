import { describe, it, expect } from 'vitest';
import {
  InputFormat,
  type ConversionInput,
} from '../../src/conversion/contracts';
import { convertFixedPoint } from '../../src/conversion/convertFixedPoint';

const bitPatternInput: ConversionInput = {
  inputString: '01001101',
  inputFormat: InputFormat.Binary,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
};

function expectInvalidConversion(
  input: ConversionInput,
  message: RegExp,
  invalidFields: readonly (keyof ConversionInput)[],
): void {
  const outcome = convertFixedPoint(input);
  expect(outcome.status).toBe('invalid');
  if (outcome.status === 'invalid') {
    expect(outcome.message).toMatch(message);
    expect(new Set(outcome.invalidFields)).toEqual(new Set(invalidFields));
  }
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
      expect(convertFixedPoint({
        ...bitPatternInput,
        inputString,
      })).toEqual({
        status: 'invalid',
        message: 'Binary string contains characters other than 0 and 1.',
        invalidFields: ['inputString'],
      });
    },
  );

  it.each(['GG', '-1', '4 D', '0x0x4D'])(
    'rejects invalid hexadecimal characters in %s',
    (inputString) => {
      expect(convertFixedPoint({
        ...bitPatternInput,
        inputString,
        inputFormat: InputFormat.Hexadecimal,
      })).toEqual({
        status: 'invalid',
        message: 'Hexadecimal string contains characters '
          + 'other than 0-9 and A-F.',
        invalidFields: ['inputString'],
      });
    },
  );

  it.each(['0100110', '001001101'])(
    'rejects binary length %s',
    (inputString) => {
      expectInvalidConversion(
        {
          ...bitPatternInput,
          inputString,
        },
        /Binary digit count/u,
        ['inputString'],
      );
    },
  );

  it.each(['F', '0FF'])('rejects hexadecimal length %s', (inputString) => {
    expectInvalidConversion({
      ...bitPatternInput,
      inputString,
      inputFormat: InputFormat.Hexadecimal,
    }, /Hexadecimal digit count/u, ['inputString']);
  });

  it.each([
    [InputFormat.Binary, '0b'],
    [InputFormat.Hexadecimal, '0x'],
  ] as const)('rejects %s prefix %s without digits', (
    inputFormat, inputString,
  ) => {
    const outcome = convertFixedPoint({
      ...bitPatternInput,
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

  it.each(['0x4D', '0X4d'])(
    'points %j to the format its prefix denotes',
    (inputString) => {
      const outcome = convertFixedPoint({
        ...bitPatternInput,
        inputString,
      });
      expect(outcome).toMatchObject({
        status: 'invalid',
        invalidFields: ['inputString'],
      });
      if (outcome.status === 'invalid') {
        expect(outcome.message).toMatch(/Select Hexadecimal/u);
      }
    },
  );

  it('keeps conversions independent and does not modify the input', () => {
    const input = Object.freeze({ ...bitPatternInput });
    const expected = {
      status: 'success',
      result: {
        hexadecimal: {
          status: 'exact',
          value: '4D',
        },
        binary: {
          status: 'original',
          value: '01001101',
        },
        decimal: {
          status: 'exact',
          value: '4.8125',
        },
      },
    };
    expect(convertFixedPoint(input)).toEqual(expected);
    expect(convertFixedPoint({
      ...input,
      inputString: 'invalid',
    }).status).toBe('invalid');
    expect(convertFixedPoint(input)).toEqual(expected);
    expect(input).toEqual(bitPatternInput);
  });
});
