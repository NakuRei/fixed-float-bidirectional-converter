import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { InputFormat } from '../src/constants/InputFormat';

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
    const name = 'Signed (two\'s complement)';
    const toggleButton = screen.getByRole('checkbox', { name });
    expect(toggleButton).toBeChecked();
    fireEvent.click(toggleButton);
    expect(screen.getByRole('checkbox', { name })).not.toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name }));
    expect(screen.getByRole('checkbox', { name })).toBeChecked();
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

  it('replaces results and errors as the input changes', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter Fixed-Point Number/iu);

    fireEvent.change(input, { target: { value: '01001101' } });
    expect(screen.getByText('4.8125')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'invalid' } });
    expect(screen.getByText('ERROR:')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '00100000' } });
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
    expect(screen.queryByText('4.8125')).not.toBeInTheDocument();
  });

  it.each(['01001101', 'invalid'])('clears the output after clearing %s', (
    value,
  ) => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter Fixed-Point Number/iu);
    fireEvent.change(input, { target: { value } });
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });

  it('recalculates the value when the sign mode changes', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter Fixed-Point Number/iu);
    fireEvent.change(input, {
      target: { value: '11001101' },
    });
    expect(screen.getByText('-3.1875')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('12.8125')).toBeInTheDocument();
    expect(screen.queryByText('-3.1875')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('-3.1875')).toBeInTheDocument();
    expect(screen.queryByText('12.8125')).not.toBeInTheDocument();
  });

  it('recalculates the output when the input format changes', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter Fixed-Point Number/iu);
    fireEvent.change(input, {
      target: { value: '4d' },
    });
    expect(screen.getByText('ERROR:')).toBeInTheDocument();

    const inputFormat = screen.getByRole('combobox', { name: 'Input Type' });
    fireEvent.change(inputFormat, {
      target: { value: InputFormat.Hexadecimal.toString() },
    });
    expect(screen.getByText('4.8125')).toBeInTheDocument();
    expect(screen.getByText('4D')).toBeInTheDocument();
    expect(input).toHaveValue('4d');
    expect(screen.getByText('01001101')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();

    fireEvent.change(inputFormat, {
      target: { value: InputFormat.Binary.toString() },
    });
    expect(screen.getByText('ERROR:')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();
  });

  it('recalculates the output when either bit count changes', () => {
    render(<App />);
    const integerInput = screen.getByPlaceholderText(/Integer Bits/iu);
    const fractionalInput = screen.getByPlaceholderText(/Fractional Bits/iu);
    const input = screen.getByPlaceholderText(/Enter Fixed-Point Number/iu);
    fireEvent.change(input, {
      target: { value: '01001101' },
    });
    expect(screen.getByText('4.8125')).toBeInTheDocument();

    fireEvent.change(integerInput, { target: { value: '3' } });
    expect(screen.getByText('ERROR:')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Result' }))
      .not.toBeInTheDocument();

    fireEvent.change(fractionalInput, { target: { value: '5' } });
    expect(screen.getByText('2.40625')).toBeInTheDocument();
    expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
  });

  it('extends hex output as bit width and sign change', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter Fixed-Point Number/iu);
    fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
      target: { value: InputFormat.Hexadecimal.toString() },
    });
    fireEvent.change(input, { target: { value: 'FF' } });
    expect(screen.getByText('FF')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Integer Bits'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByPlaceholderText('Fractional Bits'), {
      target: { value: '3' },
    });
    expect(input).toHaveValue('FF');
    expect(screen.getByText('FF')).toBeInTheDocument();
    expect(screen.queryByText('3F')).not.toBeInTheDocument();
    expect(screen.getByText('111111')).toBeInTheDocument();
    expect(screen.getByText('-0.125')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(input).toHaveValue('FF');
    expect(screen.getByText('3F')).toBeInTheDocument();
    expect(screen.queryByText('FF')).not.toBeInTheDocument();
    expect(screen.getByText('7.875')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(input).toHaveValue('FF');
    expect(screen.getByText('FF')).toBeInTheDocument();
    expect(screen.queryByText('3F')).not.toBeInTheDocument();
    expect(screen.getByText('-0.125')).toBeInTheDocument();
  });

  it('extends binary input to hex according to the sign mode', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Integer Bits'), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByPlaceholderText('Fractional Bits'), {
      target: { value: '0' },
    });
    const input = screen.getByPlaceholderText(/Enter Fixed-Point Number/iu);
    fireEvent.change(input, { target: { value: '111111' } });
    expect(screen.getByText('FF')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(input).toHaveValue('111111');
    expect(screen.getByText('111111')).toBeInTheDocument();
    expect(screen.getByText('3F')).toBeInTheDocument();
    expect(screen.getByText('63')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(input).toHaveValue('111111');
    expect(screen.getByText('FF')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it.each(['Integer Bits', 'Fractional Bits'])(
    'allows clearing and restoring %s',
    (placeholder) => {
      render(<App />);
      fireEvent.change(
        screen.getByPlaceholderText(/Enter Fixed-Point Number/iu),
        { target: { value: '01001101' } },
      );
      const input = screen.getByPlaceholderText(placeholder);
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      expect(screen.getByText('ERROR:')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Result' }))
        .not.toBeInTheDocument();

      fireEvent.change(input, { target: { value: '4' } });
      expect(screen.getByText('4.8125')).toBeInTheDocument();
      expect(screen.queryByText('ERROR:')).not.toBeInTheDocument();
    },
  );
});
