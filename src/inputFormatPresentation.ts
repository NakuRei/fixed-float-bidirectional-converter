import { InputFormat } from './conversion/contracts';

export const inputFormatPresentation = {
  [InputFormat.Binary]: {
    optionLabel: 'Binary',
    inputLabel: 'Fixed-Point Bit Pattern:',
    placeholder: 'Enter Fixed-Point Number',
    inputMode: 'numeric',
    hint: 'Use 0 or 1, optionally prefixed with 0b. No separators.',
  },
  [InputFormat.Decimal]: {
    optionLabel: 'Decimal',
    inputLabel: 'Decimal Value:',
    placeholder: 'Enter Decimal Number',
    inputMode: 'text',
    hint: 'Enter a decimal value, such as -3.1875 or 1.25e-1.',
  },
  [InputFormat.Hexadecimal]: {
    optionLabel: 'Hexadecimal',
    inputLabel: 'Fixed-Point Bit Pattern:',
    placeholder: 'Enter Fixed-Point Number',
    inputMode: 'text',
    hint: 'Use 0–9, A–F or a–f, optionally prefixed with 0x. '
      + 'No separators.',
  },
} as const;
