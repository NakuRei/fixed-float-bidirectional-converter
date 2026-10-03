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

  it('clears overflow errors after correcting the value', () => {
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
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(/floating-point range/iu);
    expect(screen.getByText('ERROR:')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '1'.repeat(1025) } });
    expect(input).toBeValid();
    expect(input).not.toHaveAccessibleDescription(/floating-point range/iu);
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });
});
