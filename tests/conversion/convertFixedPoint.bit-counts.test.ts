import { describe, it, expect } from 'vitest';
import {
  InputFormat,
  RoundingMode,
  type ConversionDiagnostic,
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

const decimalInput: ConversionInput = {
  inputString: '0',
  inputFormat: InputFormat.Decimal,
  isSigned: true,
  integerBitsString: '4',
  fractionalBitsString: '4',
  roundingMode: RoundingMode.TiesToEven,
};

const bothBitCountFields = [
  'integerBitsString',
  'fractionalBitsString',
] as const;

const malformedBitCounts = [
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
];

const malformedIntegerBits = {
  code: 'malformed-bit-count',
  fields: ['integerBitsString'],
} as const;

const malformedFractionalBits = {
  code: 'malformed-bit-count',
  fields: ['fractionalBitsString'],
} as const;

const malformedBothBits = {
  code: 'malformed-bit-count',
  fields: bothBitCountFields,
} as const;

const zeroTotalBits = {
  code: 'zero-total-bits',
  fields: bothBitCountFields,
} as const;

function expectInvalidConversion(
  input: ConversionInput,
  diagnostic: ConversionDiagnostic,
): void {
  expect(convertFixedPoint(input)).toEqual({
    status: 'invalid',
    diagnostic,
  });
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
    });
  });

  it.each<[string, string, ConversionDiagnostic]>([
    ['', '4', malformedIntegerBits],
    ['1.5', '4', malformedIntegerBits],
    ['4', '-1', malformedFractionalBits],
    ['1.5', '-1', malformedBothBits],
    ['0', '0', zeroTotalBits],
    [
      '9007199254740991',
      '1',
      {
        code: 'total-bits-exceeded',
        inputFormat: InputFormat.Binary,
        maximum: Number.MAX_SAFE_INTEGER,
        fields: bothBitCountFields,
      },
    ],
  ])('rejects bit counts %s + %s with an empty bit pattern', (
    integerBitsString, fractionalBitsString, diagnostic,
  ) => {
    expectInvalidConversion({
      ...bitPatternInput,
      inputString: '',
      integerBitsString,
      fractionalBitsString,
    }, diagnostic);
  });

  it.each(malformedBitCounts)(
    'rejects invalid integer bit count %s',
    (integerBitsString) => {
      expectInvalidConversion(
        {
          ...bitPatternInput,
          integerBitsString,
        },
        malformedIntegerBits,
      );
    },
  );

  it.each(malformedBitCounts)(
    'rejects invalid fractional bit count %s',
    (fractionalBitsString) => {
      expectInvalidConversion(
        {
          ...bitPatternInput,
          fractionalBitsString,
        },
        malformedFractionalBits,
      );
    },
  );

  it('identifies both invalid bit counts', () => {
    expectInvalidConversion({
      ...bitPatternInput,
      integerBitsString: '1.5',
      fractionalBitsString: '-1',
    }, malformedBothBits);
  });

  it.each<ConversionInput>([
    bitPatternInput,
    {
      ...bitPatternInput,
      inputFormat: InputFormat.Hexadecimal,
    },
    {
      ...decimalInput,
      inputString: '',
    },
  ])('rejects zero total bits for $inputFormat input', (input) => {
    expectInvalidConversion({
      ...input,
      integerBitsString: '0',
      fractionalBitsString: '0',
    }, zeroTotalBits);
  });
});
