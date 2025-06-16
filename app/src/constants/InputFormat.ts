export const InputFormat: Record<string, number> = {
  Binary: 2,
  Hexadecimal: 16,
} as const;

export type InputFormatType = (typeof InputFormat)[keyof typeof InputFormat];
