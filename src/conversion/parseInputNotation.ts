import {
  InputFormat,
  type InputFormatType,
  type BitPatternFormat,
  type ConversionDiagnostic,
} from './contracts';

const prefixPatterns = {
  [InputFormat.Binary]: /^0b/iu,
  [InputFormat.Hexadecimal]: /^0x/iu,
} satisfies Record<BitPatternFormat, RegExp>;

const bitPatternNotations = {
  [InputFormat.Binary]: {
    allowedCharacters: /^[01]*$/u,
    radix: 2,
    bitsPerDigit: 1,
  },
  [InputFormat.Hexadecimal]: {
    allowedCharacters: /^[0-9A-Fa-f]*$/u,
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
    .find((format) => prefixPatterns[format].test(inputString)) ?? null;
}

type BitPatternParse = {
  status: 'valid';
  binaryString: string;
} | {
  status: 'invalid';
  diagnostic: Extract<ConversionDiagnostic, {
    code: 'invalid-characters' | 'digit-count-mismatch';
  }>;
};

export function parseBitPattern(
  inputString: string,
  inputFormat: BitPatternFormat,
  totalBits: number,
): BitPatternParse {
  const notation = bitPatternNotations[inputFormat];
  const digits = inputString.replace(prefixPatterns[inputFormat], '');
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
  if (digits.length !== expectedLength) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'digit-count-mismatch',
        inputFormat,
        expected: expectedLength,
        actual: digits.length,
        fields: ['inputString'],
      },
    };
  }
  const binaryString = digits
    .split('')
    .map((character) => parseInt(character, notation.radix).toString(2)
      .padStart(notation.bitsPerDigit, '0'))
    .join('')
    // Rounding up the digit count can leave excess leading bits.
    .slice(-totalBits);
  return {
    status: 'valid',
    binaryString,
  };
}
