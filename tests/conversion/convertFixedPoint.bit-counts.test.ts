import { describe, it, expect } from 'vitest';
import { InputFormat } from '../../src/conversion/InputFormat';
import { RoundingMode } from '../../src/conversion/RoundingMode';
import {
  convertFixedPoint,
  type ConversionInput,
} from '../../src/conversion/convertFixedPoint';

const bitPatternInput: ConversionInput = {
  inputString: '01001101',
  inputFormat: InputFormat.Binary,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
};

const decimalInput: ConversionInput = {
  inputString: '0',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.NearestEven,
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

describe('convertFixedPoint bit counts', () => {
  it.each([['4', '4'], ['0', '4'], ['4', '0']])(
    'returns empty with valid bit counts %s + %s',
    (integerBitsString, fractionalBitsString) => {
      expect(convertFixedPoint({
        ...bitPatternInput,
        inputString: '',
        integerBitsString,
        fractionalBitsString,
      })).toEqual({ status: 'empty' });
    },
  );

  it('accepts leading zeros in bit counts', () => {
    expect(convertFixedPoint({
      ...bitPatternInput,
      integerBitsString: '004',
      fractionalBitsString: '04',
    })).toEqual({
      status: 'success',
      result: {
        inputFormat: InputFormat.Binary,
        inputString: '01001101',
        fixedPoint: {
          status: 'exact',
          hexadecimal: '4D',
          binary: '01001101',
        },
        float64: {
          status: 'exact',
          value: '4.8125',
        },
      },
    });
  });

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
      ...bitPatternInput,
      inputString: '',
      integerBitsString,
      fractionalBitsString,
    }, /Bit counts must|Total bit count (?:must|is)/u, invalidFields);
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
          ...bitPatternInput,
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
          ...bitPatternInput,
          fractionalBitsString,
        },
        /Bit counts/u,
        ['fractionalBitsString'],
      );
    },
  );

  it('identifies both invalid bit counts', () => {
    expectInvalidConversion({
      ...bitPatternInput,
      integerBitsString: '1.5',
      fractionalBitsString: '-1',
    }, /Bit counts/u, ['integerBitsString', 'fractionalBitsString']);
  });

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
        ...bitPatternInput,
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

  it('explains that zero total bits is below the minimum', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      inputString: '',
      integerBitsString: '0',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'invalid',
      message: 'Total bit count must be at least 1.',
      invalidFields: ['integerBitsString', 'fractionalBitsString'],
    });
  });

  it.each([
    [InputFormat.Binary, '0'.repeat(16388)],
    [InputFormat.Hexadecimal, '0'.repeat(4097)],
  ] as const)('accepts %s patterns beyond the decimal input bit limit', (
    inputFormat, inputString,
  ) => {
    expect(convertFixedPoint({
      ...bitPatternInput,
      inputFormat,
      inputString,
      integerBitsString: '16388',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'success',
      result: {
        inputFormat,
        inputString,
        fixedPoint: {
          status: 'exact',
          hexadecimal: '0'.repeat(4097),
          binary: '0'.repeat(16388),
        },
        float64: {
          status: 'exact',
          value: '0',
        },
      },
    });
  });

  it('allows the supported maximum bit width', () => {
    expect(convertFixedPoint({
      ...decimalInput,
      integerBitsString: '16384',
      fractionalBitsString: '0',
    })).toEqual({
      status: 'success',
      result: {
        inputFormat: InputFormat.Decimal,
        inputString: '0',
        fixedPoint: {
          status: 'exact',
          hexadecimal: '0'.repeat(4096),
          binary: '0'.repeat(16384),
        },
      },
    });
  });

  it.each(['16385', '9007199254740991'])(
    'rejects a bit width of %s before allocating the output',
    (integerBitsString) => {
      expect(convertFixedPoint({
        ...decimalInput,
        integerBitsString,
        fractionalBitsString: '0',
      })).toEqual({
        status: 'invalid',
        message: 'Decimal conversion supports at most 16384 total bits.',
        invalidFields: ['integerBitsString', 'fractionalBitsString'],
      });
    },
  );
});
