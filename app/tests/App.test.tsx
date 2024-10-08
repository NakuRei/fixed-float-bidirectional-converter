import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('renders without crashing and displays the correct title', () => {
    render(<App />);

    // ヘッダー内のタイトルをチェック
    const headerTitle = screen.getByText(
      'Fixed-Float Bidirectional Converter',
      { selector: 'header div' },
    );
    expect(headerTitle).toBeInTheDocument();

    // メインコンテンツ内の h1 タイトルをチェック
    const mainTitle = screen.getByRole('heading', {
      name: 'Fixed-Float Bidirectional Converter',
      level: 1,
    });
    expect(mainTitle).toBeInTheDocument();
  });

  it('handles integer bits input correctly', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Integer Bits/iu);
    fireEvent.change(input, { target: { value: '8' } });
    expect(input).toHaveValue('8');
  });

  it('handles fractional bits input correctly', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Fractional Bits/iu);
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

  it('handles binary string input correctly and displays result', async() => {
    render(<App />);
    const binaryInput = screen.getByPlaceholderText(
      /Enter Fixed-Point Number/iu,
    );
    const integerInput = screen.getByPlaceholderText(/Integer Bits/iu);
    const fractionalInput = screen.getByPlaceholderText(/Fractional Bits/iu);

    fireEvent.change(integerInput, { target: { value: '4' } });
    fireEvent.change(fractionalInput, { target: { value: '4' } });
    fireEvent.change(binaryInput, { target: { value: '01001101' } });

    await waitFor(() => {
      expect(screen.queryByText(/Result/iu)).toBeInTheDocument();
    });

    const resultLabel = screen.getByText(/Result/iu);
    expect(resultLabel).toBeInTheDocument();

    const floatResultValue = screen.getByText('4.8125');
    expect(floatResultValue).toBeInTheDocument();
    const hexResultValue = screen.getByText('4D');
    expect(hexResultValue).toBeInTheDocument();
  });

  it('displays error message for invalid binary string input', async() => {
    render(<App />);
    const binaryInput = screen.getByPlaceholderText(
      /Enter Fixed-Point Number/iu,
    );

    fireEvent.change(binaryInput, { target: { value: 'invalid' } });

    // Ensure state updates and component re-renders
    await waitFor(() => {
      expect(screen.queryByText(/ERROR:/iu)).toBeInTheDocument();
    });

    const error = screen.getByText(/ERROR:/iu);
    expect(error).toBeInTheDocument();
  });
});
