import { describe, it, expect, beforeAll } from 'vitest';
import { TwosComplementBinary2FloatStrategy } from '../../../../src/utils/binaryConverter/strategy/TwosComplementBinary2FloatStrategy';

describe('TwosComplementBinary2FloatStrategy', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let strategy: TwosComplementBinary2FloatStrategy;

  beforeAll(() => {
    strategy = new TwosComplementBinary2FloatStrategy();
  });

  it('should correctly convert positive integers', () => {
    expect(strategy.convert('01010', 5, 0)).toBe('10');
  });

  it('should correctly convert negative integers', () => {
    expect(strategy.convert('11010', 5, 0)).toBe('-6');
  });

  it('should correctly convert positive numbers with fractional parts', () => {
    expect(strategy.convert('01010100', 5, 3)).toBe('10.5');
    expect(strategy.convert('0110101', 3, 4)).toBe('3.3125');
    expect(strategy.convert('01101', 4, 1)).toBe('6.5');
  });

  it('should correctly convert negative numbers with fractional parts', () => {
    expect(strategy.convert('10101100', 5, 3)).toBe('-10.5');
    expect(strategy.convert('1001011', 3, 4)).toBe('-3.3125');
    expect(strategy.convert('10011', 4, 1)).toBe('-6.5');
  });

  it('should handle edge cases', () => {
    expect(strategy.convert('10000', 5, 0)).toBe('-16');
    expect(strategy.convert('01111', 5, 0)).toBe('15');
    expect(strategy.convert('10000000', 5, 3)).toBe('-16');
    expect(strategy.convert('01111111', 5, 3)).toBe('15.875');
    expect(strategy.convert('01', 1, 1)).toBe('0.5');
    expect(strategy.convert('11', 1, 1)).toBe('-0.5');
    expect(strategy.convert('001', 2, 1)).toBe('0.5');
    expect(strategy.convert('101', 2, 1)).toBe('-1.5');
    expect(strategy.convert('0001', 1, 3)).toBe('0.125');
    expect(strategy.convert('1111', 1, 3)).toBe('-0.125');
  });

  it('should handle zero correctly', () => {
    expect(strategy.convert('00000', 5, 0)).toBe('0');
  });

  it('should handle the case where all bits are 1', () => {
    expect(strategy.convert('11111', 5, 0)).toBe('-1');
    expect(strategy.convert('1111111', 3, 4)).toBe('-0.0625');
  });

  it('should handle the case where only the sign bit is 1', () => {
    expect(strategy.convert('100000', 6, 0)).toBe('-32');
    expect(strategy.convert('10000000', 3, 5)).toBe('-4');
  });

  it('should handle 1-bit integer part with fractional bits correctly', () => {
    expect(strategy.convert('010', 1, 2)).toBe('0.5');
    expect(strategy.convert('110', 1, 2)).toBe('-0.5');
    expect(strategy.convert('011', 1, 2)).toBe('0.75');
    expect(strategy.convert('111', 1, 2)).toBe('-0.25');
  });

  it('should handle numbers with only fractional part', () => {
    expect(strategy.convert('0101', 0, 4)).toBe('0.3125');
    expect(strategy.convert('1011', 0, 4)).toBe('-0.3125');
  });

  it('should handle larger bit numbers', () => {
    // 32-bit example
    expect(strategy.convert('01000000000000000000000000000000', 32, 0)).toBe(
      (2 ** 30).toString(),
    );
    expect(strategy.convert('11000000000000000000000000000000', 32, 0)).toBe(
      (-(2 ** 30)).toString(),
    );
  });

  it('should handle very small fractional values', () => {
    expect(strategy.convert('000000000001', 0, 12)).toBe(
      (1 / 2 ** 12).toString(),
    );
    expect(strategy.convert('100000000001', 1, 11)).toBe(
      (-1 + 1 / 2 ** 11).toString(),
    );
  });
});
