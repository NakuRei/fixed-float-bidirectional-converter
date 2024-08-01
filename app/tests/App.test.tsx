import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Binary to Float Converter/i)).toBeInTheDocument();
  });

  it('handles integer bits input correctly', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Integer Bits/i);
    fireEvent.change(input, { target: { value: '8' } });
    expect(input).toHaveValue('8');
  });

  it('handles fractional bits input correctly', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Fractional Bits/i);
    fireEvent.change(input, { target: { value: '4' } });
    expect(input).toHaveValue('4');
  });

  it('toggles between signed and unsigned modes', () => {
    render(<App />);
    const toggleButton = screen.getByRole('checkbox');
    expect(screen.getByText('Signed (Twos Complement)')).toBeInTheDocument();
    fireEvent.click(toggleButton);
    expect(screen.getByText('Unsigned')).toBeInTheDocument();
  });

  it('handles binary string input correctly and displays result', async () => {
    render(<App />);
    const binaryInput = screen.getByPlaceholderText(
      /Enter Fixed-Point Number/i,
    );
    const integerInput = screen.getByPlaceholderText(/Integer Bits/i);
    const fractionalInput = screen.getByPlaceholderText(/Fractional Bits/i);

    fireEvent.change(integerInput, { target: { value: '4' } });
    fireEvent.change(fractionalInput, { target: { value: '4' } });
    fireEvent.change(binaryInput, { target: { value: '01001101' } });

    // Ensure state updates and component re-renders
    await waitFor(() => {
      expect(screen.queryByText(/Result:/i)).toBeInTheDocument();
    });

    const resultLabel = screen.getByText(/Result:/i);
    expect(resultLabel).toBeInTheDocument();

    const resultValue = screen.getByText('4.8125');
    expect(resultValue).toBeInTheDocument();
  });

  it('displays error message for invalid binary string input', async () => {
    render(<App />);
    const binaryInput = screen.getByPlaceholderText(
      /Enter Fixed-Point Number/i,
    );

    fireEvent.change(binaryInput, { target: { value: 'invalid' } });

    // Ensure state updates and component re-renders
    await waitFor(() => {
      expect(screen.queryByText(/ERROR:/i)).toBeInTheDocument();
    });

    const error = screen.getByText(/ERROR:/i);
    expect(error).toBeInTheDocument();
  });
});
