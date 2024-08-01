import { describe, it, expect } from 'vitest';

import { validateBinaryString } from '../../src/utils/validateBinaryString';

describe('validateBinaryString', () => {
  it('should throw an error for invalid binary strings', () => {
    expect(() => {
      validateBinaryString('invalid');
    }).toThrowError('Binary string contains characters other than 0 and 1');
    expect(() => {
      validateBinaryString('01a01');
    }).toThrowError('Binary string contains characters other than 0 and 1');
    expect(() => {
      validateBinaryString('');
    }).toThrowError('Binary string contains characters other than 0 and 1');
  });

  it('should not throw an error for valid binary strings', () => {
    expect(() => {
      validateBinaryString('010101');
    }).not.toThrow();
    expect(() => {
      validateBinaryString('1111');
    }).not.toThrow();
    expect(() => {
      validateBinaryString('00000');
    }).not.toThrow();
  });
});
