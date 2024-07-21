import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders hello world heading', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Hello world!');
  });

  it('applies correct CSS classes', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toHaveClass('text-3xl');
    expect(headingElement).toHaveClass('font-bold');
    expect(headingElement).toHaveClass('underline');
  });
});
