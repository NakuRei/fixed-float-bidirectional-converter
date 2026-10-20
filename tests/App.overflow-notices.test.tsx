import { expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';
import { InputFormat, OverflowMode } from '../src/conversion/contracts';

it.each([
  [OverflowMode.Saturate, '8', /outside.*saturated/u, false],
  [OverflowMode.Wrap, '8', /outside.*wrapped/u, false],
  [OverflowMode.Saturate, '7.99', /rounded.*outside.*saturated/u, true],
  [OverflowMode.Wrap, '7.99', /rounded.*outside.*wrapped/u, true],
] as const)('announces %s for %s in the status region', (
  overflowMode, value, message, rounded,
) => {
  render(<App />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
    target: { value: InputFormat.Decimal },
  });
  fireEvent.change(screen.getByRole('combobox', { name: 'Overflow' }), {
    target: { value: overflowMode },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Decimal Value:' }), {
    target: { value },
  });
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent(message);
  if (!rounded) {
    expect(status).not.toHaveTextContent(/rounded/u);
  }
  expect(status).not.toHaveTextContent(overflowMode === OverflowMode.Saturate
    ? /wrapped/u
    : /saturated/u);
});

it('updates notices on mode changes and clears obsolete notices', () => {
  render(<App />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
    target: { value: InputFormat.Decimal },
  });
  const mode = screen.getByRole('combobox', { name: 'Overflow' });
  const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
  const status = screen.getByRole('status');
  fireEvent.change(mode, { target: { value: OverflowMode.Saturate } });
  fireEvent.change(input, { target: { value: '8' } });
  expect(status).toHaveTextContent(/saturated/u);
  fireEvent.change(mode, { target: { value: OverflowMode.Wrap } });
  expect(status).toHaveTextContent(/wrapped/u);
  expect(status).not.toHaveTextContent(/saturated/u);

  fireEvent.change(mode, { target: { value: OverflowMode.Error } });
  expect(input).toBeInvalid();
  expect(status).toHaveTextContent(/outside/u);
  expect(status).not.toHaveTextContent(/saturated|wrapped/u);

  fireEvent.change(mode, { target: { value: OverflowMode.Wrap } });
  expect(status).toHaveTextContent(/wrapped/u);
  fireEvent.change(input, { target: { value: '1' } });
  expect(status).toBeEmptyDOMElement();
  fireEvent.change(input, { target: { value: '0.03' } });
  expect(status).toHaveTextContent(/rounded/u);
  expect(status).not.toHaveTextContent(/saturated|wrapped/u);
  fireEvent.change(input, { target: { value: '8' } });
  expect(status).toHaveTextContent(/wrapped/u);
  fireEvent.change(input, { target: { value: '' } });
  expect(status).toBeEmptyDOMElement();
});

it.each([
  [
    OverflowMode.Saturate,
    '08000000000000000',
    /saturated.*Precision was lost/u,
  ],
  [OverflowMode.Wrap, '18000000000000001', /wrapped.*Precision was lost/u],
] as const)('announces %s before Float64 precision loss', (
  overflowMode, value, message,
) => {
  render(<App />);
  for (const [name, count] of [
    ['Integer Bits:', '64'],
    ['Fractional Bits:', '0'],
  ]) {
    fireEvent.change(screen.getByRole('textbox', { name }), {
      target: { value: count },
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
  }), { target: { value } });
  expect(screen.getByRole('status')).toHaveTextContent(message);
});
