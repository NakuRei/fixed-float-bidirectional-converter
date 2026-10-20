import {
  InputFormat,
  type ConversionDiagnostic,
} from './conversion/contracts';
import { inputFormatPresentation } from './inputFormatPresentation';

const prefixes = {
  [InputFormat.Binary]: '0b',
  [InputFormat.Hexadecimal]: '0x',
} as const;

const allowedCharacterDescriptions = {
  [InputFormat.Binary]: '0 and 1',
  [InputFormat.Hexadecimal]: '0-9 and A-F',
} as const;

function describeTotalBitsExceeded(
  diagnostic: Extract<ConversionDiagnostic, { code: 'total-bits-exceeded' }>,
): string {
  const maximum = diagnostic.maximum.toString();
  return diagnostic.inputFormat === InputFormat.Decimal
    ? `Decimal conversion supports at most ${maximum} total bits.`
    : `Total bit count must be at most ${maximum}.`;
}

function describeDigitCountMismatch(
  diagnostic: Extract<ConversionDiagnostic, { code: 'digit-count-mismatch' }>,
): string {
  const qualifier = diagnostic.requirement === 'minimum' ? 'at least ' : '';
  return `${inputFormatPresentation[diagnostic.inputFormat].optionLabel} `
    + `digit count should be ${qualifier}${diagnostic.expected.toString()}, `
    + `but got ${diagnostic.actual.toString()}.`;
}

export function describeConversionDiagnostic(
  diagnostic: ConversionDiagnostic,
): string {
  switch (diagnostic.code) {
    case 'malformed-bit-count':
      return 'Bit counts must be non-negative whole numbers.';
    case 'zero-total-bits':
      return 'Total bit count must be at least 1.';
    case 'total-bits-exceeded':
      return describeTotalBitsExceeded(diagnostic);
    case 'foreign-prefix': {
      const label = inputFormatPresentation[diagnostic.prefixFormat]
        .optionLabel;
      return `The ${prefixes[diagnostic.prefixFormat]} prefix denotes `
        + `${label}. Select ${label} as the input format.`;
    }
    case 'invalid-characters':
      return `${inputFormatPresentation[diagnostic.inputFormat].optionLabel} `
        + 'string contains characters other than '
        + `${allowedCharacterDescriptions[diagnostic.inputFormat]}.`;
    case 'digit-count-mismatch':
      return describeDigitCountMismatch(diagnostic);
    case 'malformed-decimal':
      return 'Enter a valid decimal number.';
    case 'out-of-range':
      return 'Value is outside the selected fixed-point range.';
    case 'inexact-value':
      return 'Value cannot be represented exactly in the selected '
        + 'fixed-point format.';
    default: {
      const unreachable: never = diagnostic;
      return unreachable;
    }
  }
}
