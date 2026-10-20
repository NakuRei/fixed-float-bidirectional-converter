import { expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../src/App';
import { InputFormat, OverflowMode } from '../src/conversion/contracts';

it('rejects excess bits in Error and applies the selected mode', () => {
  render(<App />);
  for (const name of ['Integer Bits:', 'Fractional Bits:']) {
    fireEvent.change(screen.getByRole('textbox', { name }), {
      target: { value: '3' },
    });
  }
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
    target: { value: InputFormat.Hexadecimal },
  });
  const input = screen.getByRole('textbox', {
    name: 'Fixed-Point Bit Pattern:',
  });
  fireEvent.change(input, { target: { value: 'DF' } });
  expect(input).toBeInvalid();
  expect(input).toHaveAccessibleDescription(/outside the selected/u);
  const overflow = screen.getByRole('combobox', { name: 'Overflow' });
  for (const [mode, binary, action] of [
    [OverflowMode.Saturate, '100000', 'saturated'],
    [OverflowMode.Wrap, '011111', 'wrapped'],
  ]) {
    fireEvent.change(overflow, { target: { value: mode } });
    expect(input).toBeValid();
    const row = within(screen.getByRole('group', {
      name: 'Binary conversion',
    }));
    expect(row.getByText(binary)).toBeVisible();
    expect(row.getByText(action)).toBeVisible();
  }
  fireEvent.change(overflow, { target: { value: OverflowMode.Error } });
  expect(input).toBeInvalid();
  expect(screen.queryByRole('heading', { name: 'Result' }))
    .not.toBeInTheDocument();
});

it.each([
  [
    OverflowMode.Saturate,
    `01${'0'.repeat(1100)}`,
    `0${'1'.repeat(1099)}`,
    'saturated',
  ],
  [
    OverflowMode.Wrap,
    `0101${'0'.repeat(1098)}`,
    `01${'0'.repeat(1098)}`,
    'wrapped',
  ],
])('shows %s even when the stored value exceeds Float64', (
  overflowMode, inputString, binary, action,
) => {
  render(<App />);
  for (const [name, value] of [
    ['Integer Bits:', '1100'],
    ['Fractional Bits:', '0'],
  ]) {
    fireEvent.change(screen.getByRole('textbox', { name }), {
      target: { value },
    });
  }
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
    target: { value: InputFormat.Hexadecimal },
  });
  fireEvent.change(screen.getByRole('combobox', { name: 'Overflow' }), {
    target: { value: overflowMode },
  });
  fireEvent.change(screen.getByRole('textbox', {
    name: 'Fixed-Point Bit Pattern:',
  }), { target: { value: BigInt(`0b${inputString}`).toString(16) } });
  const row = screen.getByRole('group', { name: 'Decimal conversion' });
  expect(within(row).getByText('Out of range')).toBeVisible();
  expect(within(row).getByText(action)).toBeVisible();
  expect(row).toHaveAccessibleDescription(/outside the Float64 range/u);
  expect(within(screen.getByRole('group', { name: 'Binary conversion' }))
    .getByText(binary)).toBeVisible();
});

it.each([
  [
    OverflowMode.Saturate,
    '08000000000000000',
    '9223372036854776000',
    'saturated',
  ],
  [
    OverflowMode.Wrap,
    '18000000000000001',
    '-9223372036854776000',
    'wrapped',
  ],
])('preserves Float64 rounding with %s', (
  overflowMode, inputString, decimal, action,
) => {
  render(<App />);
  for (const [name, value] of [
    ['Integer Bits:', '64'],
    ['Fractional Bits:', '0'],
  ]) {
    fireEvent.change(screen.getByRole('textbox', { name }), {
      target: { value },
    });
  }
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
    target: { value: InputFormat.Hexadecimal },
  });
  fireEvent.change(screen.getByRole('combobox', { name: 'Overflow' }), {
    target: { value: overflowMode },
  });
  fireEvent.change(screen.getByRole('textbox', {
    name: 'Fixed-Point Bit Pattern:',
  }), { target: { value: inputString } });
  const row = screen.getByRole('group', { name: 'Decimal conversion' });
  expect(within(row).getByText(decimal)).toBeVisible();
  expect(within(row).getByText('rounded')).toBeVisible();
  expect(within(row).getByText(action)).toBeVisible();
  expect(row).toHaveAccessibleDescription(/Precision was lost/u);
});

it.each([
  [InputFormat.Decimal, 'Decimal', '8', 'Hexadecimal', '7F', '80'],
  [InputFormat.Binary, 'Binary', '010000000', 'Hexadecimal', '7F', '80'],
  [
    InputFormat.Hexadecimal,
    'Hexadecimal',
    '0x080',
    'Binary',
    '01111111',
    '10000000',
  ],
] as const)('selects overflow for %s', (
  inputFormat, inputLabel, inputString, outputLabel, saturated, wrapped,
) => {
  render(<App />);
  const overflow = screen.getByRole('combobox', { name: 'Overflow' });
  expect(overflow).toHaveValue(OverflowMode.Error);
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
    target: { value: inputFormat },
  });
  const input = screen.getByRole('textbox', {
    name: inputFormat === InputFormat.Decimal
      ? 'Decimal Value:'
      : 'Fixed-Point Bit Pattern:',
  });
  fireEvent.change(input, { target: { value: inputString } });
  expect(input).toBeInvalid();
  for (const [mode, value, action] of [
    [OverflowMode.Saturate, saturated, 'saturated'],
    [OverflowMode.Wrap, wrapped, 'wrapped'],
  ]) {
    fireEvent.change(overflow, { target: { value: mode } });
    expect(input).toBeValid();
    expect(input).toHaveValue(inputString);
    const output = within(screen.getByRole('group', {
      name: `${outputLabel} conversion`,
    }));
    expect(output.getByText(value)).toBeVisible();
    expect(output.getByText(action)).toBeVisible();
    expect(output.queryByText('exact')).not.toBeInTheDocument();
    const original = within(screen.getByRole('group', {
      name: `${inputLabel} conversion`,
    }));
    expect(original.getByText(inputString)).toBeVisible();
    expect(original.getByText('original')).toBeVisible();
    expect(original.queryByText(/^(?:saturated|wrapped)$/u))
      .not.toBeInTheDocument();
  }
  fireEvent.change(overflow, { target: { value: OverflowMode.Error } });
  expect(input).toBeInvalid();
});

it.each([OverflowMode.Saturate, OverflowMode.Wrap])(
  'preserves precision labels with %s', (overflowMode) => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Overflow' }), {
      target: { value: overflowMode },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
      target: { value: InputFormat.Decimal },
    });
    for (const [value, outputValue, precision, adjusted] of [
      ['1', '10', 'exact', false],
      ['0.1', '02', 'rounded', false],
      [
        '7.96875',
        overflowMode === OverflowMode.Saturate ? '7F' : '80',
        'rounded',
        true,
      ],
    ] as const) {
      fireEvent.change(screen.getByRole('textbox', {
        name: 'Decimal Value:',
      }), {
        target: { value },
      });
      const output = within(screen.getByRole('group', {
        name: 'Hexadecimal conversion',
      }));
      expect(output.getByText(outputValue)).toBeVisible();
      expect(output.getByText(precision)).toBeVisible();
      const action = output.queryByText(/^(?:saturated|wrapped)$/u);
      if (adjusted) {
        expect(action).toHaveTextContent(overflowMode === OverflowMode.Saturate
          ? 'saturated'
          : 'wrapped');
      } else {
        expect(action).not.toBeInTheDocument();
      }
    }
  },
);
