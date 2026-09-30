import { describe, it, expect } from 'vitest';

import { validateBinaryStringLength } from '../../../src/utils/binaryConverter/validateBinaryStringLength';

describe('validateBinaryStringLength', () => {
  it('should return the total number of bits', () => {
    expect(validateBinaryStringLength(5, 3, '01010100')).toBe(8);
    expect(validateBinaryStringLength(3, 4, '0110101')).toBe(7);
    expect(validateBinaryStringLength(4, 1, '01101')).toBe(5);
  });

  it('should throw an error for invalid binary strings', () => {
    expect(() => {
      validateBinaryStringLength(5, 3, '0101010');
    }).toThrowError();
    expect(() => {
      validateBinaryStringLength(3, 4, '011010');
    }).toThrowError();
    expect(() => {
      validateBinaryStringLength(4, 1, '0110');
    }).toThrowError();
  });
});
