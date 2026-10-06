import { InputFormat, type InputFormatType } from '../constants/InputFormat';

export type BitPatternFormat = typeof InputFormat.Binary
  | typeof InputFormat.Hexadecimal;

const binaryPrefix = {
  pattern: /^0b/iu,
  message: 'The 0b prefix denotes binary. Select Binary as the input type.',
};

const hexPrefix = {
  pattern: /^0x/iu,
  message: 'The 0x prefix denotes hexadecimal. '
    + 'Select Hexadecimal as the input type.',
};

const ownPrefixes = {
  [InputFormat.Binary]: binaryPrefix,
  [InputFormat.Hexadecimal]: hexPrefix,
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
  digits: string;
} | {
  status: 'invalid';
  message: string;
};

export function parseBitPattern(
  inputString: string,
  inputType: BitPatternFormat,
  totalBits: number,
): BitPatternParse {
  const isBinary = inputType === InputFormat.Binary;
  const digits = inputString.replace(ownPrefixes[inputType].pattern, '');
  const allowedCharacters = isBinary
    ? /^[01]*$/u
    : /^[0-9A-Fa-f]*$/u;
  if (!allowedCharacters.test(digits)) {
    return {
      status: 'invalid',
      message: isBinary
        ? 'Binary string contains characters other than 0 and 1'
        : 'Hex string contains characters other than 0-9 and A-F',
    };
  }
  const expectedLength = isBinary
    ? totalBits
    : Math.ceil(totalBits / 4);
  if (digits.length !== expectedLength) {
    const inputName = isBinary
      ? 'Binary'
      : 'Hex';
    return {
      status: 'invalid',
      message: `${inputName} digit count should be `
        + `${expectedLength.toString()}, `
        + `but got ${digits.length.toString()}`,
    };
  }
  return {
    status: 'valid',
    digits,
  };
}
