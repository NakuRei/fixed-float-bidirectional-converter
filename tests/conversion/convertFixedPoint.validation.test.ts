import { describe, it, expect } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
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

describe('convertFixedPoint input validation', () => {
  it.each([['4', '4'], ['0', '4'], ['4', '0']])(
    'returns empty with valid bit counts %s + %s',
    (integerBitsString, fractionalBitsString) => {
      expect(convertFixedPoint({
        ...validInput,
        inputString: '',
        integerBitsString,
        fractionalBitsString,
      })).toEqual({ status: 'empty' });
    },
  );

  it.each([
    ['', '4', ['integerBitsString']],
    ['1.5', '4', ['integerBitsString']],
    ['4', '-1', ['fractionalBitsString']],
    ['1.5', '-1', ['integerBitsString', 'fractionalBitsString']],
    ['0', '0', ['integerBitsString', 'fractionalBitsString']],
    ['9007199254740991', '1', ['integerBitsString', 'fractionalBitsString']],
  ] as const)('rejects bit counts %s + %s with an empty bit pattern', (
    integerBitsString, fractionalBitsString, invalidFields,
  ) => {
    expectInvalidConversion({
      ...validInput,
      inputString: '',
      integerBitsString,
      fractionalBitsString,
    }, /Bit counts must|Total bit count (?:must|is)/u, invalidFields);
  });

  it.each(['invalid', '01a01', '01001102', '0100 1101', '0b0b0b0b'])(
    'rejects invalid binary characters in %s',
    (inputString) => {
      expect(convertFixedPoint({
        ...validInput,
        inputString,
      })).toEqual({
        status: 'invalid',
        message: 'Binary string contains characters other than 0 and 1',
        invalidFields: ['inputString'],
      });
    },
  );

  it.each(['GG', '-1', '4 D', '0x0x4D'])(
    'rejects invalid hex characters in %s',
    (inputString) => {
      expect(convertFixedPoint({
        ...validInput,
        inputString,
        inputFormat: InputFormat.Hexadecimal,
      })).toEqual({
        status: 'invalid',
        message: 'Hex string contains characters other than 0-9 and A-F',
        invalidFields: ['inputString'],
      });
    },
  );

  it.each(['0100110', '001001101'])(
    'rejects binary length %s',
    (inputString) => {
      expectInvalidConversion(
        {
          ...validInput,
          inputString,
        },
        /Binary digit count/u,
        ['inputString'],
      );
    },
  );

  it.each(['F', '0FF'])('rejects hex length %s', (inputString) => {
    expectInvalidConversion({
      ...validInput,
      inputString,
      inputFormat: InputFormat.Hexadecimal,
    }, /Hex digit count/u, ['inputString']);
  });

  it.each([
    '',
    '-1',
    '+4',
    '1.5',
    '4bits',
    ' 4',
    '4 ',
    '1e2',
    '9007199254740992',
    '9'.repeat(400),
  ])(
    'rejects invalid integer bit count %s',
    (integerBitsString) => {
      expectInvalidConversion(
        {
          ...validInput,
          integerBitsString,
        },
        /Bit counts/u,
        ['integerBitsString'],
      );
    },
  );

  it.each([
    '',
    '-1',
    '+4',
    '1.5',
    '4bits',
    ' 4',
    '4 ',
    '1e2',
    '9007199254740992',
    '9'.repeat(400),
  ])(
    'rejects invalid fractional bit count %s',
    (fractionalBitsString) => {
      expectInvalidConversion(
        {
          ...validInput,
          fractionalBitsString,
        },
        /Bit counts/u,
        ['fractionalBitsString'],
      );
    },
  );

  it.each([
    [InputFormat.Binary, '0', '0', 'Total bit count must be at least 1.'],
    [InputFormat.Hexadecimal, '0', '0', 'Total bit count must be at least 1.'],
    [
      InputFormat.Binary,
      '9007199254740991',
      '1',
      'Total bit count is too large.',
    ],
    [
      InputFormat.Hexadecimal,
      '9007199254740991',
      '1',
      'Total bit count is too large.',
    ],
  ] as const)(
    'explains unsupported bit counts for %s input: %s + %s',
    (inputFormat, integerBitsString, fractionalBitsString, message) => {
      expect(convertFixedPoint({
        ...validInput,
        inputFormat,
        integerBitsString,
        fractionalBitsString,
      })).toEqual({
        status: 'invalid',
        message,
        invalidFields: ['integerBitsString', 'fractionalBitsString'],
      });
    },
  );

  it.each([
    [InputFormat.Binary, '0'.repeat(16388)],
    [InputFormat.Hexadecimal, '0'.repeat(4097)],
  ] as const)('accepts %s patterns beyond the decimal input bit limit', (
    inputFormat, inputString,
  ) => {
    expect(convertFixedPoint({
      ...validInput,
      inputFormat,
      inputString,
      integerBitsString: '16388',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'success',
      result: {
        binary: {
          status: inputFormat === InputFormat.Binary ? 'original' : 'exact',
          value: '0'.repeat(16388),
        },
        hexadecimal: {
          status: inputFormat === InputFormat.Hexadecimal
            ? 'original'
            : 'exact',
          value: '0'.repeat(4097),
        },
        decimal: {
          status: 'exact',
          value: '0',
        },
      },
    });
  });

  it('identifies both invalid bit counts', () => {
    expectInvalidConversion({
      ...validInput,
      integerBitsString: '1.5',
      fractionalBitsString: '-1',
    }, /Bit counts/u, ['integerBitsString', 'fractionalBitsString']);
  });

  it('accepts leading zeros in bit counts', () => {
    expect(convertFixedPoint({
      ...validInput,
      integerBitsString: '004',
      fractionalBitsString: '04',
    })).toEqual({
      status: 'success',
      result: {
        binary: {
          status: 'original',
          value: '01001101',
        },
        hexadecimal: {
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

  it('keeps conversions independent and does not modify the input', () => {
    const input = Object.freeze({ ...validInput });
    const expected = {
      status: 'success',
      result: {
        binary: {
          status: 'original',
          value: '01001101',
        },
        hexadecimal: {
          status: 'exact',
          value: '4D',
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
    expect(input).toEqual(validInput);
  });
});
