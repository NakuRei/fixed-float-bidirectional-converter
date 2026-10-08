export const InputFormat = {
  Binary: 'binary',
  Decimal: 'decimal',
  Hexadecimal: 'hexadecimal',
} as const;

export type InputFormatType = (typeof InputFormat)[keyof typeof InputFormat];
