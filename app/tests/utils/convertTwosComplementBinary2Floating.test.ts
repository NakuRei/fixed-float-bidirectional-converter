import { describe, it, expect } from 'vitest';

import { convertTwosComplementBinary2Floating } from '../../src/utils/convertTwosComplement2Floating';

describe('convertTwosComplementBinary2Floating', () => {
  it('should correctly convert positive integers', () => {
    expect(convertTwosComplementBinary2Floating('01010', 5, 0)).toBe(10);
  });

  it('should correctly convert negative integers', () => {
    expect(convertTwosComplementBinary2Floating('11010', 5, 0)).toBe(-6);
  });

  it('should correctly convert positive numbers with fractional parts', () => {
    expect(convertTwosComplementBinary2Floating('01010100', 5, 3)).toBeCloseTo(
      10.5,
      5,
    );
    expect(convertTwosComplementBinary2Floating('0110101', 3, 4)).toBeCloseTo(
      3.3125,
      5,
    );
    expect(convertTwosComplementBinary2Floating('01101', 4, 1)).toBe(6.5);
  });

  it('should correctly convert negative numbers with fractional parts', () => {
    expect(convertTwosComplementBinary2Floating('10101100', 5, 3)).toBeCloseTo(
      -10.5,
      5,
    );
    expect(convertTwosComplementBinary2Floating('1001011', 3, 4)).toBeCloseTo(
      -3.3125,
      5,
    );
    expect(convertTwosComplementBinary2Floating('10011', 4, 1)).toBe(-6.5);
  });

  it('should handle edge cases', () => {
    expect(convertTwosComplementBinary2Floating('10000', 5, 0)).toBe(-16);
    expect(convertTwosComplementBinary2Floating('01111', 5, 0)).toBe(15);
    expect(convertTwosComplementBinary2Floating('10000000', 5, 3)).toBe(-16);
    expect(convertTwosComplementBinary2Floating('01111111', 5, 3)).toBeCloseTo(
      15.875,
      5,
    );
    expect(convertTwosComplementBinary2Floating('01', 1, 1)).toBe(0.5);
    expect(convertTwosComplementBinary2Floating('11', 1, 1)).toBe(-0.5);
    expect(convertTwosComplementBinary2Floating('001', 2, 1)).toBe(0.5);
    expect(convertTwosComplementBinary2Floating('101', 2, 1)).toBe(-1.5);
    expect(convertTwosComplementBinary2Floating('0001', 1, 3)).toBeCloseTo(
      0.125,
      5,
    );
    expect(convertTwosComplementBinary2Floating('1111', 1, 3)).toBeCloseTo(
      -0.125,
      5,
    );
  });

  it('should handle zero correctly', () => {
    expect(convertTwosComplementBinary2Floating('00000', 5, 0)).toBe(0);
  });

  it('should handle the case where all bits are 1', () => {
    expect(convertTwosComplementBinary2Floating('11111', 5, 0)).toBe(-1);
    expect(convertTwosComplementBinary2Floating('1111111', 3, 4)).toBeCloseTo(
      -0.0625,
      5,
    );
  });

  it('should handle the case where only the sign bit is 1', () => {
    expect(convertTwosComplementBinary2Floating('100000', 6, 0)).toBe(-32);
    expect(convertTwosComplementBinary2Floating('10000000', 3, 5)).toBeCloseTo(
      -4,
      5,
    );
  });

  it('should throw an error for invalid input length', () => {
    expect(() => convertTwosComplementBinary2Floating('1010', 5, 0)).toThrow();
    expect(() =>
      convertTwosComplementBinary2Floating('101010', 5, 0),
    ).toThrow();
    expect(() =>
      convertTwosComplementBinary2Floating('1010101010', 2, 6),
    ).toThrow();
  });

  it('should handle 1-bit integer part with fractional bits correctly', () => {
    expect(convertTwosComplementBinary2Floating('010', 1, 2)).toBe(0.5);
    expect(convertTwosComplementBinary2Floating('110', 1, 2)).toBe(-0.5);
    expect(convertTwosComplementBinary2Floating('011', 1, 2)).toBe(0.75);
    expect(convertTwosComplementBinary2Floating('111', 1, 2)).toBe(-0.25);
  });

  it('should handle numbers with only fractional part', () => {
    expect(convertTwosComplementBinary2Floating('0101', 0, 4)).toBeCloseTo(
      0.3125,
      5,
    );
    expect(convertTwosComplementBinary2Floating('1011', 0, 4)).toBeCloseTo(
      -0.3125,
      5,
    );
  });

  it('should handle larger bit numbers', () => {
    // 32-bit example
    expect(
      convertTwosComplementBinary2Floating(
        '01000000000000000000000000000000',
        32,
        0,
      ),
    ).toBe(2 ** 30);
    expect(
      convertTwosComplementBinary2Floating(
        '11000000000000000000000000000000',
        32,
        0,
      ),
    ).toBe(-(2 ** 30));
  });

  it('should handle very small fractional values', () => {
    expect(
      convertTwosComplementBinary2Floating('000000000001', 0, 12),
    ).toBeCloseTo(1 / 2 ** 12, 10);
    expect(
      convertTwosComplementBinary2Floating('100000000001', 1, 11),
    ).toBeCloseTo(-1 + 1 / 2 ** 11, 10);
  });
});
