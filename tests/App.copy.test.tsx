import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import App from '../src/App';
import { InputFormat } from '../src/conversion/InputFormat';

const writeText = vi.fn<(text: string) => Promise<void>>();

function enterInput(format: number, input: string): void {
  fireEvent.change(screen.getByRole('combobox', { name: 'Input Type' }), {
    target: { value: format.toString() },
  });
  fireEvent.change(screen.getByRole('textbox', {
    name: format === InputFormat.Decimal
      ? 'Decimal Value:'
      : 'Fixed-Point Bit Pattern:',
  }), { target: { value: input } });
}

function copyButton(label: string): HTMLElement {
  const row = screen.getByRole('group', { name: `${label} conversion` });
  return within(row).getByRole('button', { name: `Copy ${label} value` });
}

async function copyAndSettle(label: string): Promise<void> {
  await act(async() => {
    fireEvent.click(copyButton(label));
    await writeText.mock.results.at(-1)?.value;
  });
}

describe('Copying conversion results', () => {
  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['Hex', 'cd'],
    ['Binary', '11001101'],
    ['Decimal', '-3.1875'],
  ])('copies the displayed %s value', async(label, value) => {
    render(<App />);
    enterInput(InputFormat.Hexadecimal, 'cd');

    fireEvent.click(copyButton(label));

    expect(writeText).toHaveBeenCalledExactlyOnceWith(value);
    expect(await screen.findByText(`${label} value copied`))
      .toBeInTheDocument();
  });

  it('copies the original decimal input as entered', () => {
    render(<App />);
    enterInput(InputFormat.Decimal, '+001.2800e0');

    fireEvent.click(copyButton('Decimal'));

    expect(writeText).toHaveBeenCalledExactlyOnceWith('+001.2800e0');
  });

  it('offers no copy button for an out-of-range decimal result', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Integer Bits:' }), {
      target: { value: '1025' },
    });
    fireEvent.change(screen.getByRole('textbox', {
      name: 'Fractional Bits:',
    }), { target: { value: '0' } });
    enterInput(InputFormat.Binary, `1${'0'.repeat(1024)}`);

    const decimalRow = screen.getByRole('group', {
      name: 'Decimal conversion',
    });
    expect(within(decimalRow).getByText('Out of range')).toBeInTheDocument();
    expect(within(decimalRow).queryByRole('button')).not.toBeInTheDocument();
    expect(copyButton('Hex')).toBeInTheDocument();
  });

  it('reports a clipboard failure', async() => {
    writeText.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    render(<App />);
    enterInput(InputFormat.Hexadecimal, 'cd');

    fireEvent.click(copyButton('Hex'));

    expect(await screen.findByText('Could not copy Hex value'))
      .toBeInTheDocument();
    expect(screen.queryByText('Hex value copied')).not.toBeInTheDocument();
  });

  it('clears the copied message after a short delay', async() => {
    vi.useFakeTimers();
    render(<App />);
    enterInput(InputFormat.Hexadecimal, 'cd');

    await copyAndSettle('Hex');
    expect(screen.getByText('Hex value copied')).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });
    expect(screen.queryByText('Hex value copied')).not.toBeInTheDocument();
  });

  it('restarts the copied message on a repeated copy', async() => {
    vi.useFakeTimers();
    render(<App />);
    enterInput(InputFormat.Hexadecimal, 'cd');

    await copyAndSettle('Hex');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    await copyAndSettle('Hex');
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(writeText).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Hex value copied')).toBeInTheDocument();
  });

  it('clears the copied message when the result changes', async() => {
    render(<App />);
    enterInput(InputFormat.Hexadecimal, 'cd');
    fireEvent.click(copyButton('Hex'));
    expect(await screen.findByText('Hex value copied')).toBeInTheDocument();

    enterInput(InputFormat.Hexadecimal, 'ce');

    expect(screen.queryByText('Hex value copied')).not.toBeInTheDocument();
  });
});
