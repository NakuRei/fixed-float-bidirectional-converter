import { describe, it, expect } from 'vitest';
import { InputFormat } from '../../src/constants/InputFormat';
import {
  convertFixedPoint,
  type ConversionInput,
} from '../../src/utils/convertFixedPoint';

const validInput: ConversionInput = {
  inputString: '01001101',
  inputType: InputFormat.Binary,
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
    }, /Bit counts must|Total bit count must/u, invalidFields);
  });

  it.each(['invalid', '01a01', '01001102', ' 1001101', '0100110 '])(
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

  it.each(['GG', '0x4D', '-1', ' F', 'F '])(
    'rejects invalid hex characters in %s',
    (inputString) => {
      expect(convertFixedPoint({
        ...validInput,
        inputString,
        inputType: InputFormat.Hexadecimal,
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
        /Binary string length/u,
        ['inputString'],
      );
    },
  );

  it.each(['F', '0FF'])('rejects hex length %s', (inputString) => {
    expectInvalidConversion({
      ...validInput,
      inputString,
      inputType: InputFormat.Hexadecimal,
    }, /Hex string length/u, ['inputString']);
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

  it.each([['0', '0'], ['9007199254740991', '1']])(
    'rejects unsupported total bit counts %s + %s',
    (integerBitsString, fractionalBitsString) => {
      expectInvalidConversion({
        ...validInput,
        integerBitsString,
        fractionalBitsString,
      }, /total bit count/iu, ['integerBitsString', 'fractionalBitsString']);
    },
  );

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
        binaryString: '01001101',
        hexString: '4D',
        floatString: '4.8125',
      },
    });
  });

  it('keeps conversions independent and does not modify the input', () => {
    const input = Object.freeze({ ...validInput });
    const expected = {
      status: 'success',
      result: {
        binaryString: '01001101',
        hexString: '4D',
        floatString: '4.8125',
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
