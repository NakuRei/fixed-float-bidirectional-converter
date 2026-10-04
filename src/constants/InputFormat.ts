export const InputFormat = {
  Binary: 2,
  Decimal: 10,
  Hexadecimal: 16,
} as const;

export type InputFormatType = (typeof InputFormat)[keyof typeof InputFormat];
