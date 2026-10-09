import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';
import { InputFormat } from '../src/conversion/InputFormat';

describe('Accessible converter controls', () => {
  it('exposes the input names, instructions and selected format', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
    const integerBits = screen.getByRole('textbox', { name: 'Integer Bits:' });
    const fractionalBits = screen.getByRole('textbox', {
      name: 'Fractional Bits:',
    });
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });

    expect(integerBits).toHaveValue('4');
    expect(integerBits).toHaveAccessibleDescription(/sign bit when signed/u);
    expect(fractionalBits).toHaveValue('4');
    expect(input).toHaveAccessibleDescription(/Use 0 or 1/u);
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByRole('combobox', { name: 'Input Format' }))
      .toHaveValue(InputFormat.Binary);
    expect(screen.getByRole('option', {
      name: 'Binary',
      selected: true,
    })).toBeInTheDocument();
  });

  it('updates the format instructions while keeping the input name', () => {
    render(<App />);
    const inputFormatCombobox = screen.getByRole('combobox', {
      name: 'Input Format',
    });
    fireEvent.change(inputFormatCombobox, {
      target: { value: InputFormat.Hexadecimal },
    });
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });
    expect(input).toHaveAttribute('inputmode', 'text');
    expect(input).toHaveAccessibleDescription(/optionally prefixed with 0x/u);
    expect(screen.getByRole('option', {
      name: 'Hexadecimal',
      selected: true,
    })).toBeInTheDocument();

    fireEvent.change(inputFormatCombobox, {
      target: { value: InputFormat.Binary },
    });
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAccessibleDescription(/Use 0 or 1/u);
  });

  it.each([
    ['1.5', '4', true, false],
    ['1e2', '4', true, false],
    ['4', '-1', false, true],
    ['1.5', '-1', true, true],
    ['0', '0', true, true],
    ['9007199254740991', '1', true, true],
  ])('associates bit count errors for %s + %s with the affected fields', (
    integerValue, fractionalValue, integerInvalid, fractionalInvalid,
  ) => {
    render(<App />);
    const integerBits = screen.getByRole('textbox', { name: 'Integer Bits:' });
    const fractionalBits = screen.getByRole('textbox', {
      name: 'Fractional Bits:',
    });
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });
    fireEvent.change(input, { target: { value: '01001101' } });
    fireEvent.change(integerBits, { target: { value: integerValue } });
    fireEvent.change(fractionalBits, { target: { value: fractionalValue } });

    expect(integerBits).toHaveValue(integerValue);
    expect(fractionalBits).toHaveValue(fractionalValue);
    const errorDescription = /Bit counts must|Total bit count (?:must|is)/u;
    for (const [field, invalid] of [
      [integerBits, integerInvalid],
      [fractionalBits, fractionalInvalid],
    ] as const) {
      if (invalid) {
        expect(field).toBeInvalid();
        expect(field).toHaveAccessibleDescription(errorDescription);
      } else {
        expect(field).toBeValid();
        expect(field).not.toHaveAccessibleDescription(errorDescription);
      }
    }
    expect(input).toBeValid();
    expect(input).not.toHaveAccessibleDescription(errorDescription);
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();
  });

  it.each([
    [InputFormat.Binary, 'invalid', /characters other than 0 and 1/u],
    [InputFormat.Binary, '01', /digit count should be 8/u],
    [InputFormat.Binary, '0x4D', /Select Hexadecimal/u],
    [InputFormat.Hexadecimal, 'GG', /characters other than 0-9 and A-F/u],
    [InputFormat.Hexadecimal, 'F', /digit count should be 2/u],
  ])('associates the error for %s input %j and clears it after correction', (
    inputFormat, invalidValue, errorDescription,
  ) => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
      target: { value: inputFormat },
    });
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });
    fireEvent.change(input, { target: { value: invalidValue } });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(errorDescription);
    for (const name of ['Integer Bits:', 'Fractional Bits:']) {
      const bitCount = screen.getByRole('textbox', { name });
      expect(bitCount).toBeValid();
      expect(bitCount).not.toHaveAccessibleDescription(errorDescription);
    }

    fireEvent.change(input, {
      target: {
        value: inputFormat === InputFormat.Binary ? '01001101' : '4d',
      },
    });
    expect(input).toBeValid();
    expect(input).not.toHaveAccessibleDescription(errorDescription);
    expect(input).toHaveAccessibleDescription(/No separators/u);
    expect(screen.getByText('4.8125')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });

  it('converts signed hex and recovers after an invalid bit count', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Format' }), {
      target: { value: InputFormat.Hexadecimal },
    });
    const inputName = 'Fixed-Point Bit Pattern:';
    fireEvent.change(screen.getByRole('textbox', { name: inputName }), {
      target: { value: 'CD' },
    });
    expect(screen.getByText('-3.1875')).toBeInTheDocument();

    const signedName = 'Signed (two\'s complement)';
    fireEvent.click(screen.getByRole('checkbox', { name: signedName }));
    expect(screen.getByRole('checkbox', { name: signedName }))
      .not.toBeChecked();
    expect(screen.getByRole('textbox', { name: inputName })).toHaveValue('CD');
    expect(screen.getByText('12.8125')).toBeInTheDocument();

    const integerBits = screen.getByRole('textbox', { name: 'Integer Bits:' });
    fireEvent.change(integerBits, { target: { value: '1.5' } });
    expect(integerBits).toHaveValue('1.5');
    expect(integerBits).toBeInvalid();
    expect(integerBits).toHaveAccessibleDescription(/Bit counts must/u);
    expect(integerBits).toHaveAccessibleDescription(/sign bit when signed/u);
    expect(screen.queryByText('12.8125')).not.toBeInTheDocument();

    fireEvent.change(integerBits, { target: { value: '4' } });
    expect(integerBits).toBeValid();
    expect(integerBits).not.toHaveAccessibleDescription(/Bit counts must/u);
    expect(integerBits).toHaveAccessibleDescription(/sign bit when signed/u);
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
    expect(screen.getByText('12.8125')).toBeInTheDocument();
  });

  it.each([
    ['Integer Bits:', ''],
    ['Integer Bits:', '01001101'],
    ['Fractional Bits:', ''],
    ['Fractional Bits:', '01001101'],
  ])('keeps %s errors with initial pattern "%s" until correction', (
    bitCountName, initialPattern,
  ) => {
    render(<App />);
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });
    const bitCount = screen.getByRole('textbox', { name: bitCountName });
    fireEvent.change(input, { target: { value: initialPattern } });
    fireEvent.change(bitCount, { target: { value: '1.5' } });
    expect(bitCount).toBeInvalid();
    expect(bitCount).toHaveAccessibleDescription(/Bit counts must/u);

    fireEvent.change(input, { target: { value: '' } });
    expect(bitCount).toHaveValue('1.5');
    expect(bitCount).toBeInvalid();
    expect(bitCount).toHaveAccessibleDescription(/Bit counts must/u);
    expect(input).toBeValid();
    expect(input).not.toHaveAccessibleDescription(/Bit counts must/u);
    expect(screen.getByText('ERROR:')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.change(bitCount, { target: { value: '4' } });
    expect(bitCount).toBeValid();
    expect(bitCount).not.toHaveAccessibleDescription(/Bit counts must/u);
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();
  });

  it('clears bit pattern errors when only the bit pattern is cleared', () => {
    render(<App />);
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });
    fireEvent.change(input, { target: { value: '01' } });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(/digit count should be 8/u);

    fireEvent.change(input, { target: { value: '' } });
    expect(input).toBeValid();
    expect(input).not.toHaveAccessibleDescription(/digit count should be 8/u);
    expect(input).toHaveAccessibleDescription(/Use 0 or 1/u);
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();
  });
});
