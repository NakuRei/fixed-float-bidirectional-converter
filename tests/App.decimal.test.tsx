import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';
import { InputFormat } from '../src/constants/InputFormat';
import { RoundingMode } from '../src/constants/RoundingMode';

describe('Decimal input in the converter', () => {
  it('recalculates the result when the rounding mode changes', () => {
    render(<App />);
    expect(screen.queryByRole('combobox', { name: 'Fixed-point rounding' }))
      .not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: InputFormat.Decimal.toString() },
    });
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    const rounding = screen.getByRole('combobox', {
      name: 'Fixed-point rounding',
    });
    expect(rounding).toHaveValue(RoundingMode.NearestEven);
    fireEvent.change(input, { target: { value: '0.1' } });
    expect(screen.getByText('0.1')).toBeInTheDocument();
    expect(screen.queryByText('0.125')).not.toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();

    fireEvent.change(rounding, {
      target: { value: RoundingMode.TowardZero },
    });
    expect(input).toHaveValue('0.1');
    expect(screen.getByText('0.1')).toBeInTheDocument();
    expect(screen.queryByText('0.0625')).not.toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();

    fireEvent.change(rounding, { target: { value: RoundingMode.Exact } });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(/cannot be represented exactly/u);
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '0.125' } });
    expect(input).toBeValid();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });

  it('retains the rounding selection when switching input formats', () => {
    render(<App />);
    const format = screen.getByRole('combobox', { name: 'Input Type' });
    fireEvent.change(format, {
      target: { value: InputFormat.Decimal.toString() },
    });
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Fixed-point rounding' }),
      { target: { value: RoundingMode.Exact } },
    );
    fireEvent.change(format, {
      target: { value: InputFormat.Hexadecimal.toString() },
    });
    expect(screen.queryByRole('combobox', { name: 'Fixed-point rounding' }))
      .not.toBeInTheDocument();
    fireEvent.change(format, {
      target: { value: InputFormat.Decimal.toString() },
    });
    expect(screen.getByRole('combobox', { name: 'Fixed-point rounding' }))
      .toHaveValue(RoundingMode.Exact);
  });

  it('encodes the signed example and updates the input guidance', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: InputFormat.Decimal.toString() },
    });
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    expect(input).toHaveAccessibleDescription(/decimal value/u);
    expect(screen.getByRole('option', { name: 'Decimal',
      selected: true }))
      .toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '-3.1875' } });
    expect(input).toBeValid();
    expect(screen.getByText('CD')).toBeInTheDocument();
    expect(screen.getByText('11001101')).toBeInTheDocument();
    expect(screen.getByText('-3.1875')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });

  it('revalidates a negative decimal when the sign mode changes', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: InputFormat.Decimal.toString() },
    });
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    fireEvent.change(input, { target: { value: '-3.1875' } });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(input).toHaveValue('-3.1875');
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(/range/iu);
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(input).toBeValid();
    expect(screen.getByText('CD')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });

  it('reinterprets the same input when switching all three formats', () => {
    render(<App />);
    const format = screen.getByRole('combobox', { name: 'Input Type' });
    fireEvent.change(format, {
      target: { value: InputFormat.Decimal.toString() },
    });
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    fireEvent.change(input, { target: { value: '01' } });
    expect(screen.getByText('00010000')).toBeInTheDocument();

    fireEvent.change(format, {
      target: { value: InputFormat.Hexadecimal.toString() },
    });
    expect(screen.getByRole('textbox', { name: 'Fixed-Point Bit Pattern:' }))
      .toHaveValue('01');
    expect(input).toHaveAccessibleDescription(/A–F/u);
    expect(screen.getByText('00000001')).toBeInTheDocument();

    fireEvent.change(format, {
      target: { value: InputFormat.Binary.toString() },
    });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(/length should be 8/u);

    fireEvent.change(format, {
      target: { value: InputFormat.Decimal.toString() },
    });
    expect(input).toBeValid();
    expect(input).toHaveValue('01');
    expect(screen.getByText('00010000')).toBeInTheDocument();
  });

  it('recalculates the encoding when the bit allocation changes', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: InputFormat.Decimal.toString() },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Decimal Value:' }), {
      target: { value: '-3.1875' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Integer Bits:' }), {
      target: { value: '3' },
    });
    expect(screen.getByText('1001101')).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Fractional Bits:' }),
      { target: { value: '5' } },
    );
    expect(screen.getByText('9A')).toBeInTheDocument();
    expect(screen.getByText('10011010')).toBeInTheDocument();
    expect(screen.getByText('-3.1875')).toBeInTheDocument();
  });

  it('clears decimal errors and results when the input is cleared', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: InputFormat.Decimal.toString() },
    });
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    fireEvent.change(input, { target: { value: 'invalid' } });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(/decimal/iu);

    fireEvent.change(input, { target: { value: '' } });
    expect(input).toBeValid();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '-3.1875' } });
    expect(screen.getByText('CD')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();
  });
});
