import { expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';
import { InputFormat, OverflowMode } from '../src/conversion/contracts';

it.each(([
  [InputFormat.Binary, 'Binary', '0000001', 8, 7, '000000001', 9],
  [InputFormat.Hexadecimal, 'Hexadecimal', '1', 2, 1, '001', 3],
] as const).flatMap(([
  inputFormat,
  label,
  shortInput,
  expected,
  actual,
  longInput,
  longLength,
]) => Object.values(OverflowMode).map((overflowMode) => ({
  inputFormat,
  label,
  shortInput,
  expected,
  actual,
  longInput,
  longLength,
  overflowMode,
}))))('describes $shortInput with $overflowMode', ({
  inputFormat, label, shortInput, expected, actual, longInput, longLength,
  overflowMode,
}) => {
  render(<App />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
    target: { value: inputFormat },
  });
  fireEvent.change(screen.getByRole('combobox', { name: 'Overflow' }), {
    target: { value: overflowMode },
  });
  const input = screen.getByRole('textbox', {
    name: 'Fixed-Point Bit Pattern:',
  });
  fireEvent.change(input, { target: { value: shortInput } });
  expect(input).toBeInvalid();
  const qualifier = overflowMode === OverflowMode.Error ? '' : 'at least ';
  expect(input).toHaveAccessibleDescription(new RegExp(
    `${label} digit count should be ${qualifier}${expected.toString()}, `
    + `but got ${actual.toString()}\\.`,
    'u',
  ));

  fireEvent.change(input, { target: { value: longInput } });
  if (overflowMode === OverflowMode.Error) {
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(new RegExp(
      `${label} digit count should be ${expected.toString()}, `
      + `but got ${longLength.toString()}\\.`,
      'u',
    ));
  } else {
    expect(input).toBeValid();
    expect(screen.getByRole('heading', { name: 'Result' })).toBeVisible();
  }
});
