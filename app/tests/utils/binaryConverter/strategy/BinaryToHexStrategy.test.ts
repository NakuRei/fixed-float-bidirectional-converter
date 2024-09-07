import { describe, it, expect, beforeEach } from 'vitest';
import { BinaryToHexStrategy } from '../../../../src/utils/binaryConverter/strategy/BinaryToHexStrategy';

describe('BinaryToHexStrategy', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let strategy: BinaryToHexStrategy;

  beforeEach(() => {
    strategy = new BinaryToHexStrategy();
  });

  it('should convert binary to hexadecimal correctly', () => {
    expect(strategy.convert('0010')).toBe('2');
    expect(strategy.convert('1111')).toBe('F');
    expect(strategy.convert('11011011')).toBe('DB');
  });

  it('should handle empty string', () => {
    expect(strategy.convert('')).toBe('');
  });

  it('should handle binary strings not multiple of 4 bits', () => {
    expect(strategy.convert('1')).toBe('1');
    expect(strategy.convert('11')).toBe('3');
    expect(strategy.convert('111')).toBe('7');
  });

  it('should handle binary strings between 4 and 8 bits correctly', () => {
    expect(strategy.convert('11010')).toBe('1A');
    expect(strategy.convert('110101')).toBe('35');
    expect(strategy.convert('1101101')).toBe('6D');
  });

  it('should convert very large binary strings correctly', () => {
    expect(strategy.convert('11110000111100001111000011110000')).toBe(
      'F0F0F0F0',
    );
  });
});
