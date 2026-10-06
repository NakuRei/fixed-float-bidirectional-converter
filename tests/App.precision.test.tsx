import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../src/App';
import { InputFormat } from '../src/constants/InputFormat';
import { RoundingMode } from '../src/constants/RoundingMode';

function renderDecimalInput(integerBits: string, fractionalBits: string): void {
  render(<App />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
    target: { value: InputFormat.Decimal.toString() },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Integer Bits:' }), {
    target: { value: integerBits },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Fractional Bits:' }), {
    target: { value: fractionalBits },
  });
}

describe('Conversion precision in the UI', () => {
  it.each([
    ['0.125', '02', '00000010', 'Exact'],
    ['0.1', '02', '00000010', 'rounded'],
    ['-0.1', 'FE', '11111110', 'rounded'],
    ['0.01', '00', '00000000', 'rounded'],
    ['0', '00', '00000000', 'Exact'],
    ['1.28', '14', '00010100', 'rounded'],
  ])('labels the conversion results for decimal input %s', (
    input, hex, binary, precision,
  ) => {
    renderDecimalInput('4', '4');
    fireEvent.change(screen.getByRole('textbox', { name: 'Decimal Value:' }), {
      target: { value: input },
    });
    for (const [label, value, expectedPrecision] of [
      ['Hex:', hex, precision],
      ['Binary:', binary, precision],
      ['Decimal:', input, 'original'],
    ]) {
      const row = screen.getByText(label).parentElement;
      expect(row).toHaveTextContent(`${label}${value}${expectedPrecision}`);
    }
    expect(screen.queryByText('Rounded to zero')).not.toBeInTheDocument();
  });

  it('reports rounding while preserving the original decimal', () => {
    renderDecimalInput('1', '55');
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    const rounding = screen.getByRole('combobox', {
      name: 'Fixed-point rounding',
    });
    expect(rounding).toHaveAccessibleDescription(
      /Exact only rejects precision loss in fixed-point conversion/u,
    );
    fireEvent.change(input, { target: { value: '0.1' } });
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent(
      'The decimal input was rounded to fit the fixed-point format.',
    );
    expect(status).not.toHaveTextContent(
      'Float64 represents the fixed-point value exactly.',
    );
    const float64 = screen.getByRole('group', { name: 'Decimal conversion' });
    expect(within(float64).getByText('0.1')).toBeInTheDocument();
    expect(float64).not.toHaveAccessibleDescription();

    fireEvent.change(rounding, { target: { value: RoundingMode.Exact } });
    expect(input).toBeInvalid();
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent(
      'Value cannot be represented exactly with these fractional bits.',
    );
    expect(status).not.toHaveTextContent(/rounded|Float64/u);
    expect(input).toHaveAccessibleDescription(
      /Value cannot be represented exactly with these fractional bits/u,
    );
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.change(rounding, { target: { value: RoundingMode.NearestEven } });
    expect(input).toBeValid();
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent(/decimal input was rounded/u);
    fireEvent.change(input, { target: { value: '0.125' } });
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toBeEmptyDOMElement();
  });

  it('clears the input rounding notice for empty and invalid input', () => {
    renderDecimalInput('4', '4');
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    const status = screen.getByRole('status');
    for (const inputString of ['', 'invalid']) {
      fireEvent.change(input, { target: { value: '0.1' } });
      expect(status).toHaveTextContent(/decimal input was rounded/u);
      fireEvent.change(input, { target: { value: inputString } });
      expect(screen.getByRole('status')).toBe(status);
      expect(status).not.toHaveTextContent(/rounded|Float64/u);
      if (inputString === '') {
        expect(status).toBeEmptyDOMElement();
      } else {
        expect(status).toHaveTextContent('Enter a valid decimal number.');
        expect(input).toHaveAccessibleDescription(
          /Enter a valid decimal number/u,
        );
      }
      expect(screen.queryByRole('heading', { name: 'Result' }))
        .not.toBeInTheDocument();
    }
  });

  it.each([
    [InputFormat.Hexadecimal, '0CCCCCCCCCCCCD'],
    [InputFormat.Binary, `0000${'1100'.repeat(12)}1101`],
  ])('clears decimal rounding when switching to base %s', (
    inputType, pattern,
  ) => {
    renderDecimalInput('1', '55');
    const status = screen.getByRole('status');
    fireEvent.change(screen.getByRole('textbox', { name: 'Decimal Value:' }), {
      target: { value: '0.1' },
    });
    expect(status).toHaveTextContent(/decimal input was rounded/u);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: inputType.toString() },
    });
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Fixed-Point Bit Pattern:' }),
      { target: { value: pattern } },
    );
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toBeEmptyDOMElement();
    expect(screen.getByRole('group', { name: 'Decimal conversion' }))
      .not.toHaveAccessibleDescription();
    expect(screen.getAllByText('Exact')).toHaveLength(2);
    expect(screen.getByText('original')).toBeVisible();
    expect(screen.queryByText('rounded')).not.toBeInTheDocument();
    expect(status).not.toHaveTextContent(pattern);
  });

  it('preserves wide decimal input and reports loss decoding hex', () => {
    renderDecimalInput('64', '0');
    fireEvent.change(screen.getByRole('combobox', {
      name: 'Fixed-point rounding',
    }), { target: { value: RoundingMode.Exact } });
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    fireEvent.change(input, { target: { value: '9007199254740993' } });
    expect(input).toBeValid();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    const decimal = screen.getByRole('group', { name: 'Decimal conversion' });
    expect(within(decimal).getByText('9007199254740993')).toBeVisible();
    expect(within(decimal).getByText('original')).toBeVisible();
    expect(screen.queryByText('9007199254740992')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: InputFormat.Hexadecimal.toString() },
    });
    fireEvent.change(input, { target: { value: '0020000000000001' } });
    expect(input).toBeValid();
    expect(screen.getByRole('status')).toHaveTextContent(
      /^Precision was lost converting the fixed-point value to Float64\.$/u,
    );
    expect(screen.getByText('0020000000000001')).toBeInTheDocument();
    const float64 = screen.getByRole('group', { name: 'Decimal conversion' });
    expect(within(float64).getByText('9007199254740992')).toBeInTheDocument();
    expect(within(float64).getByText('rounded')).toBeVisible();
    expect(screen.getAllByText('Exact')).toHaveLength(1);
    expect(within(screen.getByRole('group', { name: 'Hex conversion' }))
      .getByText('original')).toBeVisible();
    expect(float64).toHaveAccessibleDescription(
      'Precision was lost converting the fixed-point value to Float64.',
    );
  });

  it('preserves original decimal input outside the Float64 range', () => {
    renderDecimalInput('1028', '0');
    fireEvent.change(screen.getByRole('combobox', {
      name: 'Fixed-point rounding',
    }), { target: { value: RoundingMode.Exact } });
    const input = screen.getByRole('textbox', { name: 'Decimal Value:' });
    fireEvent.change(input, { target: { value: '1e309' } });
    expect(input).toBeValid();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByText((10n ** 309n).toString(2).padStart(1028, '0')))
      .toBeInTheDocument();
    const decimal = screen.getByRole('group', { name: 'Decimal conversion' });
    expect(within(decimal).getByText('1e309')).toBeVisible();
    expect(within(decimal).getByText('original')).toBeVisible();
    expect(decimal).not.toHaveAccessibleDescription();
    expect(screen.getAllByText('Exact')).toHaveLength(2);
    expect(screen.queryByText('Out of range')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).not.toHaveTextContent(
      (10n ** 309n).toString(2).padStart(1028, '0'),
    );
    expect(screen.getByRole('status')).not.toHaveTextContent('Out of range');
  });

  it('keeps decimal input original as the bit allocation changes', () => {
    renderDecimalInput('1', '60');
    const status = screen.getByRole('status');
    fireEvent.change(screen.getByRole('textbox', { name: 'Decimal Value:' }), {
      target: { value: '0.1' },
    });
    expect(status).toHaveTextContent(/decimal input was rounded/u);
    expect(status).not.toHaveTextContent(/Precision was lost/u);
    expect(within(screen.getByRole('group', { name: 'Decimal conversion' }))
      .getByText('original')).toBeVisible();
    expect(screen.getAllByText('rounded')).toHaveLength(2);

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Fractional Bits:' }),
      { target: { value: '55' } },
    );
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent(/decimal input was rounded/u);
    expect(status).not.toHaveTextContent(
      'Float64 represents the fixed-point value exactly.',
    );
    expect(status).not.toHaveTextContent(/Precision was lost/u);
  });
});
