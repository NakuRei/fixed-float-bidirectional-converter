import { describe, it, expect } from 'vitest';
import {
  InputFormat,
  type ConversionDiagnostic,
} from '../src/conversion/contracts';
import { describeConversionDiagnostic } from '../src/conversionDiagnosticText';

const bitCountFields = ['integerBitsString', 'fractionalBitsString'] as const;

describe('describeConversionDiagnostic', () => {
  it.each<{
    diagnostic: ConversionDiagnostic;
    text: string;
  }>([
    {
      diagnostic: {
        code: 'malformed-bit-count',
        fields: ['integerBitsString'],
      },
      text: 'Bit counts must be non-negative whole numbers.',
    },
    {
      diagnostic: {
        code: 'zero-total-bits',
        fields: bitCountFields,
      },
      text: 'Total bit count must be at least 1.',
    },
    {
      diagnostic: {
        code: 'total-bits-exceeded',
        inputFormat: InputFormat.Decimal,
        maximum: 16384,
        fields: bitCountFields,
      },
      text: 'Decimal conversion supports at most 16384 total bits.',
    },
    {
      diagnostic: {
        code: 'total-bits-exceeded',
        inputFormat: InputFormat.Hexadecimal,
        maximum: Number.MAX_SAFE_INTEGER,
        fields: bitCountFields,
      },
      text: 'Total bit count must be at most 9007199254740991.',
    },
    {
      diagnostic: {
        code: 'foreign-prefix',
        prefixFormat: InputFormat.Binary,
        fields: ['inputString'],
      },
      text: 'The 0b prefix denotes Binary. Select Binary as the input format.',
    },
    {
      diagnostic: {
        code: 'foreign-prefix',
        prefixFormat: InputFormat.Hexadecimal,
        fields: ['inputString'],
      },
      text: 'The 0x prefix denotes Hexadecimal. '
        + 'Select Hexadecimal as the input format.',
    },
    {
      diagnostic: {
        code: 'invalid-characters',
        inputFormat: InputFormat.Binary,
        fields: ['inputString'],
      },
      text: 'Binary string contains characters other than 0 and 1.',
    },
    {
      diagnostic: {
        code: 'invalid-characters',
        inputFormat: InputFormat.Hexadecimal,
        fields: ['inputString'],
      },
      text: 'Hexadecimal string contains characters other than 0-9 and A-F.',
    },
    {
      diagnostic: {
        code: 'digit-count-mismatch',
        inputFormat: InputFormat.Binary,
        expected: 8,
        actual: 7,
        fields: ['inputString'],
      },
      text: 'Binary digit count should be 8, but got 7.',
    },
    {
      diagnostic: {
        code: 'digit-count-mismatch',
        inputFormat: InputFormat.Hexadecimal,
        expected: 2,
        actual: 0,
        fields: ['inputString'],
      },
      text: 'Hexadecimal digit count should be 2, but got 0.',
    },
    {
      diagnostic: {
        code: 'malformed-decimal',
        fields: ['inputString'],
      },
      text: 'Enter a valid decimal number.',
    },
    {
      diagnostic: {
        code: 'out-of-range',
        fields: ['inputString'],
      },
      text: 'Value is outside the selected fixed-point range.',
    },
    {
      diagnostic: {
        code: 'inexact-value',
        fields: ['inputString'],
      },
      text: 'Value cannot be represented exactly with these fractional bits.',
    },
  ])('describes $diagnostic.code as "$text"', ({ diagnostic, text }) => {
    expect(describeConversionDiagnostic(diagnostic)).toBe(text);
  });
});
