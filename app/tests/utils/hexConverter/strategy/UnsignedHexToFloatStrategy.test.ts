import { describe, it, expect } from 'vitest';
import { UnsignedHexToFloatStrategy } from '../../../../src/utils/hexConverter/strategy/UnsignedHexToFloatStrategy';

describe('UnsignedHexToFloatStrategy', () => {
  const strategy = new UnsignedHexToFloatStrategy();

  it('should return 0 for hex string of 0', () => {
    expect(strategy.convert('0000', 8, 8)).toBe('0');
  });

  it('should handle hex string with only integer bits', () => {
    expect(strategy.convert('FF', 8, 0)).toBe('255');
  });

  it('should handle hex string with only fractional bits', () => {
    expect(strategy.convert('00FF', 0, 16)).toBe((255 / 65536).toString());
  });

  it('should convert hex string to float correctly '
    + 'with given integer and fractional bits', () => {
    expect(strategy.convert('1A3F', 8, 8)).toBe('26.24609375');
  });

  it('should handle hex string with mixed integer and fractional bits', () => {
    expect(strategy.convert('1234', 12, 4)).toBe((4660 / 16).toString());
  });

  it('should handle maximum value correctly', () => {
    expect(strategy.convert('FFFF', 8, 8)).toBe('255.99609375');
  });

  it('should handle very small values correctly', () => {
    expect(strategy.convert('0001', 8, 8)).toBe('0.00390625');
  });

  it('should maintain precision for fractional values', () => {
    expect(strategy.convert('0080', 8, 8)).toBe('0.5');
  });

  it('should handle hex input case-insensitively', () => {
    const upperCase = strategy.convert('FF', 8, 0);
    const lowerCase = strategy.convert('ff', 8, 0);
    expect(upperCase).toBe(lowerCase);
  });

  it('should handle long hex string input', () => {
    expect(
      parseFloat(strategy.convert('FEDCBA9876543210', 32, 32)),
    ).toBeCloseTo(81985529216486896 / (2 ** 32), -10);
  });

  it('should handle short hex string input', () => {
    expect(strategy.convert('A', 4, 0)).toBe('10');
  });

  it('should handle non-multiple of 4 total bits', () => {
    expect(strategy.convert('A', 3, 1)).toBe('5');
    expect(strategy.convert('A', 2, 2)).toBe('2.5');
    expect(strategy.convert('FF', 3, 3)).toBe((63 / 8).toString());
  });

  // 極端に大きな整数部分のテスト
  it('should handle extremely large integer parts '
    + 'with scientific notation', () => {
    // 256ビットの最大値
    const largeHex = 'F'.repeat(64);
    const result = strategy.convert(largeHex, 256, 0);

    // 科学的記法のパターンをチェック
    expect(result).toMatch(/^[1-9]\.\d+e\+\d+$/u);

    // 値の範囲をチェック
    const parsedResult = parseFloat(result);
    expect(parsedResult).toBeGreaterThan(1e77);
    expect(parsedResult).toBeLessThan(1e78);

    // 有効桁数をチェック
    const significantDigits = result.split('e')[0].replace('.', '').length;
    // IEEE 754倍精度浮動小数点数の精度
    expect(significantDigits).toBeGreaterThanOrEqual(15);
  });

  // 極端に小さな小数部分のテスト
  it('should handle extremely small fractional parts', () => {
    // 256ビットで表現可能な最小の正の数
    const smallHex = `${'0'.repeat(63)}1`;
    const result = strategy.convert(smallHex, 0, 256);
    expect(result).not.toBe('0');
    expect(parseFloat(result)).toBeGreaterThan(0);
    expect(parseFloat(result)).toBeLessThan(1);

    // 科学的記法のパターンをチェック（小さな値の場合）
    expect(result).toMatch(/^[1-9]\.\d+e-\d+$/u);
  });
});
