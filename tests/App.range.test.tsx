import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Wide fixed-point values in the converter', () => {
  it('displays zero and one with 1025 integer bits', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Integer Bits:' }), {
      target: { value: '1025' },
    });
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Fractional Bits:' }),
      { target: { value: '0' } },
    );
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });
    fireEvent.change(input, { target: { value: '0'.repeat(1025) } });
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(input).toBeValid();

    fireEvent.change(input, { target: { value: `${'0'.repeat(1024)}1` } });
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });

  it('keeps fixed-point results when Float64 overflows', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Integer Bits:' }), {
      target: { value: '1025' },
    });
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Fractional Bits:' }),
      { target: { value: '0' } },
    );
    const input = screen.getByRole('textbox', {
      name: 'Fixed-Point Bit Pattern:',
    });
    const overflowPattern = `1${'0'.repeat(1024)}`;
    fireEvent.change(input, { target: { value: overflowPattern } });
    expect(input).toHaveValue(overflowPattern);
    expect(input).toBeValid();
    expect(screen.getByText(overflowPattern)).toBeInTheDocument();
    expect(screen.getByText(`F${'0'.repeat(256)}`)).toBeInTheDocument();
    expect(screen.getByText('Out of range')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Float64 conversion' }))
      .toHaveAccessibleDescription(/outside the Float64 range/u);
    expect(screen.getByRole('heading', { name: 'Result' }))
      .toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '1'.repeat(1025) } });
    expect(input).toBeValid();
    expect(screen.queryByText('Out of range')).not.toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Float64 conversion' }))
      .toHaveAccessibleDescription(
        'Float64 represents the fixed-point value exactly.',
      );
  });
});
