import { describe, it, expect, vi } from 'vitest';
import { BinaryConverter } from '../../../src/utils/binaryConverter/BinaryConverter';
import type { BinaryConversionStrategy } from '../../../src/utils/binaryConverter/BinaryConversionStrategy';

class MockBinaryConversionStrategy1 implements BinaryConversionStrategy {
  public convert(): string {
    return 'mocked result 1';
  }
}

class MockBinaryConversionStrategy2 implements BinaryConversionStrategy {
  public convert(): string {
    return 'mocked result 2';
  }
}

vi.mock('../../../src/utils/binaryConverter/validateBinaryStringLength');
vi.mock('../../../src/utils/binaryConverter/validateBinaryString');

describe('BinaryConverter', () => {
  it('should convert using the strategy', () => {
    const converter = new BinaryConverter(new MockBinaryConversionStrategy1());
    expect(converter.convert('01000000', 4, 4)).toBe('mocked result 1');
  });

  it('should set strategy correctly', () => {
    const converter = new BinaryConverter(new MockBinaryConversionStrategy1());
    converter.setStrategy(new MockBinaryConversionStrategy2());
    expect(converter.convert('01000000', 4, 4)).toBe('mocked result 2');
  });
});
