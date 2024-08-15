import { describe, it, expect, beforeAll } from 'vitest';

import { UnsignedBinaryToFloatStrategy } from '../../../../src/utils/binaryConverter/strategy/UnsignedBinaryToFloatStrategy';

describe('UnsignedBinaryToFloatStrategy', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let strategy: UnsignedBinaryToFloatStrategy;

  beforeAll(() => {
    strategy = new UnsignedBinaryToFloatStrategy();
  });

  it('should correctly convert positive integers', () => {
    expect(strategy.convert('01010', 5, 0)).toBe('10');
  });

  it('should correctly convert positive numbers with fractional parts', () => {
    expect(strategy.convert('01010100', 5, 3)).toBe('10.5');
    expect(strategy.convert('0110101', 3, 4)).toBe('3.3125');
    expect(strategy.convert('01101', 4, 1)).toBe('6.5');
  });

  it('should handle edge cases', () => {
    expect(strategy.convert('10000', 5, 0)).toBe('16');
    expect(strategy.convert('01111', 5, 0)).toBe('15');
    expect(strategy.convert('10000000', 5, 3)).toBe('16');
    expect(strategy.convert('01111111', 5, 3)).toBe('15.875');
    expect(strategy.convert('01', 1, 1)).toBe('0.5');
    expect(strategy.convert('001', 2, 1)).toBe('0.5');
    expect(strategy.convert('0001', 1, 3)).toBe('0.125');
  });

  it('should handle zero correctly', () => {
    expect(strategy.convert('00000', 5, 0)).toBe('0');
  });
});
