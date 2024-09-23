import { describe, it, expect } from 'vitest';
import { BinaryToBinaryStrategy } from '../../../../src/utils/binaryConverter/strategy/BinaryToBinaryStrategy';

describe('BinaryToBinaryStrategy', () => {
  it('should return the same binary string', () => {
    const strategy = new BinaryToBinaryStrategy();
    const binaryString = '101010';
    const result = strategy.convert(binaryString);
    expect(result).toBe(binaryString);
  });

  it('should handle empty binary string', () => {
    const strategy = new BinaryToBinaryStrategy();
    const binaryString = '';
    const result = strategy.convert(binaryString);
    expect(result).toBe(binaryString);
  });

  it('should handle binary string with leading zeros', () => {
    const strategy = new BinaryToBinaryStrategy();
    const binaryString = '0001010';
    const result = strategy.convert(binaryString);
    expect(result).toBe(binaryString);
  });

  it('should handle binary string with only zeros', () => {
    const strategy = new BinaryToBinaryStrategy();
    const binaryString = '0000000';
    const result = strategy.convert(binaryString);
    expect(result).toBe(binaryString);
  });

  it('should handle binary string with only ones', () => {
    const strategy = new BinaryToBinaryStrategy();
    const binaryString = '1111111';
    const result = strategy.convert(binaryString);
    expect(result).toBe(binaryString);
  });
});
