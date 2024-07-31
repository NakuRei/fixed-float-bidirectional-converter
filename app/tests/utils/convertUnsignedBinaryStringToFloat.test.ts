import { describe, it, expect } from 'vitest';

import { convertUnsignedBinaryStringToFloat } from '../../src/utils/convertUnsignedBinaryStringToFloat';

describe('convertUnsignedBinaryStringToFloat', () => {
  it('should correctly convert positive integers', () => {
    expect(convertUnsignedBinaryStringToFloat('01010', 5, 0)).toBe(10);
  });

  it('should correctly convert positive numbers with fractional parts', () => {
    expect(convertUnsignedBinaryStringToFloat('01010100', 5, 3)).toBeCloseTo(
      10.5,
      5,
    );
    expect(convertUnsignedBinaryStringToFloat('0110101', 3, 4)).toBeCloseTo(
      3.3125,
      5,
    );
    expect(convertUnsignedBinaryStringToFloat('01101', 4, 1)).toBe(6.5);
  });

  it('should handle edge cases', () => {
    expect(convertUnsignedBinaryStringToFloat('10000', 5, 0)).toBe(16);
    expect(convertUnsignedBinaryStringToFloat('01111', 5, 0)).toBe(15);
    expect(convertUnsignedBinaryStringToFloat('10000000', 5, 3)).toBe(16);
    expect(convertUnsignedBinaryStringToFloat('01111111', 5, 3)).toBeCloseTo(
      15.875,
      5,
    );
    expect(convertUnsignedBinaryStringToFloat('01', 1, 1)).toBe(0.5);
    expect(convertUnsignedBinaryStringToFloat('001', 2, 1)).toBe(0.5);
    expect(convertUnsignedBinaryStringToFloat('0001', 1, 3)).toBeCloseTo(
      0.125,
      5,
    );
  });

  it('should handle zero correctly', () => {
    expect(convertUnsignedBinaryStringToFloat('00000', 5, 0)).toBe(0);
  });
});
