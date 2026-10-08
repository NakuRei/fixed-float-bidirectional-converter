import { InputFormat, type InputFormatType } from './InputFormat';

export type BitPatternFormat = keyof typeof bitPatternNotations;

const binaryPrefix = {
  pattern: /^0b/iu,
  message: 'The 0b prefix denotes binary. Select Binary as the input type.',
};

const hexPrefix = {
  pattern: /^0x/iu,
  message: 'The 0x prefix denotes hexadecimal. '
    + 'Select Hexadecimal as the input type.',
};

const bitPatternNotations = {
  [InputFormat.Binary]: {
    name: 'Binary',
    prefix: binaryPrefix,
    allowedCharacters: /^[01]*$/u,
    invalidCharacterMessage:
      'Binary string contains characters other than 0 and 1',
    radix: 2,
    bitsPerDigit: 1,
  },
  [InputFormat.Hexadecimal]: {
    name: 'Hex',
    prefix: hexPrefix,
    allowedCharacters: /^[0-9A-Fa-f]*$/u,
    invalidCharacterMessage:
      'Hex string contains characters other than 0-9 and A-F',
    radix: 16,
    bitsPerDigit: 4,
  },
};

const foreignPrefixes = {
  [InputFormat.Binary]: [hexPrefix],
  [InputFormat.Decimal]: [binaryPrefix, hexPrefix],
  // A leading 0b is a valid pair of hex digits, not a binary prefix.
  [InputFormat.Hexadecimal]: [],
};

export function findForeignPrefixMessage(
  inputString: string,
  inputType: InputFormatType,
): string | null {
  const foreignPrefix = foreignPrefixes[inputType]
    .find(({ pattern }) => pattern.test(inputString));
  return foreignPrefix?.message ?? null;
}

type BitPatternParse = {
  status: 'valid';
  binaryString: string;
} | {
  status: 'invalid';
  message: string;
};

export function parseBitPattern(
  inputString: string,
  inputType: BitPatternFormat,
  totalBits: number,
): BitPatternParse {
  const notation = bitPatternNotations[inputType];
  const digits = inputString.replace(notation.prefix.pattern, '');
  if (!notation.allowedCharacters.test(digits)) {
    return {
      status: 'invalid',
      message: notation.invalidCharacterMessage,
    };
  }
  const expectedLength = Math.ceil(totalBits / notation.bitsPerDigit);
  if (digits.length !== expectedLength) {
    return {
      status: 'invalid',
      message: `${notation.name} digit count should be `
        + `${expectedLength.toString()}, `
        + `but got ${digits.length.toString()}`,
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
