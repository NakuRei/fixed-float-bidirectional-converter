import {
  InputFormat,
  OverflowMode,
  type OverflowModeType,
  type InputFormatType,
  type BitPatternFormat,
  type ConversionDiagnostic,
} from './contracts';

const bitPatternNotations = {
  [InputFormat.Binary]: {
    allowedCharacters: /^[01]*$/u,
    prefixPattern: /^0b/iu,
    literalPrefix: '0b',
    radix: 2,
    bitsPerDigit: 1,
  },
  [InputFormat.Hexadecimal]: {
    allowedCharacters: /^[0-9A-Fa-f]*$/u,
    prefixPattern: /^0x/iu,
    literalPrefix: '0x',
    radix: 16,
    bitsPerDigit: 4,
  },
} satisfies Record<BitPatternFormat, unknown>;

const foreignPrefixFormats: Record<
  InputFormatType,
  readonly BitPatternFormat[]
> = {
  [InputFormat.Binary]: [InputFormat.Hexadecimal],
  [InputFormat.Decimal]: [InputFormat.Binary, InputFormat.Hexadecimal],
  // A leading 0b is a valid pair of hex digits, not a binary prefix.
  [InputFormat.Hexadecimal]: [],
};

export function findForeignPrefixFormat(
  inputString: string,
  inputFormat: InputFormatType,
): BitPatternFormat | null {
  return foreignPrefixFormats[inputFormat]
    .find((format) => bitPatternNotations[format].prefixPattern
      .test(inputString)) ?? null;
}

type BitPatternParse = {
  status: 'valid';
  integer: bigint;
} | {
  status: 'invalid';
  diagnostic: Extract<ConversionDiagnostic, {
    code: 'invalid-characters' | 'digit-count-mismatch';
  }>;
};

function readPatternInteger({
  pattern,
  enteredBits,
  totalBits,
  isSigned,
  hasExpectedDigits,
}: {
  pattern: bigint;
  enteredBits: number;
  totalBits: number;
  isSigned: boolean;
  hasExpectedDigits: boolean;
}): bigint {
  const entered = isSigned ? BigInt.asIntN(enteredBits, pattern) : pattern;
  if (!hasExpectedDigits) {
    return entered;
  }
  const stored = isSigned
    ? BigInt.asIntN(totalBits, pattern)
    : BigInt.asUintN(totalBits, pattern);
  // A partial hexadecimal digit may be zero-padded or sign-extended.
  const isZeroPadded = pattern === BigInt.asUintN(totalBits, pattern);
  const isSignExtended = isSigned && entered === stored;
  if (isZeroPadded || isSignExtended) {
    return stored;
  }
  return entered;
}

export function parseBitPattern(
  inputString: string,
  inputFormat: BitPatternFormat,
  totalBits: number,
  isSigned: boolean,
  overflowMode: OverflowModeType,
): BitPatternParse {
  const notation = bitPatternNotations[inputFormat];
  const digits = inputString.replace(notation.prefixPattern, '');
  if (!notation.allowedCharacters.test(digits)) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'invalid-characters',
        inputFormat,
        fields: ['inputString'],
      },
    };
  }
  const expectedLength = Math.ceil(totalBits / notation.bitsPerDigit);
  if (digits.length < expectedLength
    || (overflowMode === OverflowMode.Error
      && digits.length !== expectedLength)) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'digit-count-mismatch',
        requirement: overflowMode === OverflowMode.Error ? 'exact' : 'minimum',
        inputFormat,
        expected: expectedLength,
        actual: digits.length,
        fields: ['inputString'],
      },
    };
  }
  const pattern = BigInt(notation.literalPrefix + digits);
  return {
    status: 'valid',
    integer: readPatternInteger({
      pattern,
      enteredBits: digits.length * notation.bitsPerDigit,
      totalBits,
      isSigned,
      hasExpectedDigits: digits.length === expectedLength,
    }),
  };
}

export function formatBitPattern(
  integer: bigint,
  outputFormat: BitPatternFormat,
  totalBits: number,
): string {
  const notation = bitPatternNotations[outputFormat];
  const digitCount = Math.ceil(totalBits / notation.bitsPerDigit);
  // Negative values sign-extend to fill the leading digit.
  return BigInt.asUintN(digitCount * notation.bitsPerDigit, integer)
    .toString(notation.radix)
    .padStart(digitCount, '0')
    .toUpperCase();
}
