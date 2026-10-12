import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../src/App';
import {
  InputFormat,
  RoundingMode,
} from '../src/conversion/contracts';

describe('Original and converted output values', () => {
  it.each([
    {
      format: InputFormat.Hexadecimal,
      input: 'cd',
      rows: [
        ['Hexadecimal', 'cd', 'original'],
        ['Binary', '11001101', 'exact'],
        ['Decimal', '-3.1875', 'exact'],
      ],
    },
    {
      format: InputFormat.Hexadecimal,
      input: '0x14',
      rows: [
        ['Hexadecimal', '0x14', 'original'],
        ['Binary', '00010100', 'exact'],
        ['Decimal', '1.25', 'exact'],
      ],
    },
    {
      format: InputFormat.Binary,
      input: '00010100',
      rows: [
        ['Hexadecimal', '14', 'exact'],
        ['Binary', '00010100', 'original'],
        ['Decimal', '1.25', 'exact'],
      ],
    },
    {
      format: InputFormat.Binary,
      input: '0b00010100',
      rows: [
        ['Hexadecimal', '14', 'exact'],
        ['Binary', '0b00010100', 'original'],
        ['Decimal', '1.25', 'exact'],
      ],
    },
    {
      format: InputFormat.Decimal,
      input: '+001.2800e0',
      rows: [
        ['Hexadecimal', '14', 'rounded'],
        ['Binary', '00010100', 'rounded'],
        ['Decimal', '+001.2800e0', 'original'],
      ],
    },
    {
      format: InputFormat.Decimal,
      input: '-0.000',
      rows: [
        ['Hexadecimal', '00', 'exact'],
        ['Binary', '00000000', 'exact'],
        ['Decimal', '-0.000', 'original'],
      ],
    },
  ])('preserves $input entered as $format', ({ format, input, rows }) => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
      target: { value: format },
    });
    fireEvent.change(screen.getByRole('textbox', {
      name: format === InputFormat.Decimal
        ? 'Decimal Value:'
        : 'Fixed-Point Bit Pattern:',
    }), { target: { value: input } });
    for (const [label, value, precision] of rows) {
      const row = screen.getByRole('group', { name: `${label} conversion` });
      expect(within(row).getByText(value)).toBeVisible();
      expect(within(row).getByText(precision)).toBeVisible();
    }
    expect(screen.getAllByText('original')).toHaveLength(1);
  });

  it('keeps Decimal original when changing the rounding mode for 1.28', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
      target: { value: InputFormat.Decimal },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Decimal Value:' }), {
      target: { value: '1.28' },
    });
    const rounding = screen.getByRole('combobox', {
      name: 'Fixed-point rounding',
    });
    for (const mode of [RoundingMode.NearestEven, RoundingMode.TowardZero]) {
      fireEvent.change(rounding, { target: { value: mode } });
      for (const [label, value, precision] of [
        ['Hexadecimal', '14', 'rounded'],
        ['Binary', '00010100', 'rounded'],
        ['Decimal', '1.28', 'original'],
      ]) {
        const row = screen.getByRole('group', { name: `${label} conversion` });
        expect(within(row).getByText(value)).toBeVisible();
        expect(within(row).getByText(precision)).toBeVisible();
      }
      expect(screen.queryByText('1.25')).not.toBeInTheDocument();
    }
  });
});
