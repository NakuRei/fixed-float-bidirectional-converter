import { describe, it, expect } from 'vitest';

import { validateBinaryString } from '../../../src/utils/binaryConverter/validateBinaryString';

describe('validateBinaryString', () => {
  it('should throw an error for invalid binary strings', () => {
    expect(() => {
      validateBinaryString('invalid');
    }).toThrowError();
    expect(() => {
      validateBinaryString('01a01');
    }).toThrowError();
    expect(() => {
      validateBinaryString('');
    }).toThrowError();
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
