import { describe, it, expect } from 'vitest';
import { validateHexStringLength } from '../../../src/utils/hexConverter/validateHexStringLength';

describe('validateHexStringLength', () => {
  it('should not throw an error for valid hex string length', () => {
    expect(() => {
      validateHexStringLength(8, 4, '00F');
    }).not.toThrow();
    expect(() => {
      validateHexStringLength(16, 0, 'FFFF');
    }).not.toThrow();
    expect(() => {
      validateHexStringLength(4, 4, 'FF');
    }).not.toThrow();
  });

  it('should throw an error for invalid hex string length', () => {
    expect(() => {
      validateHexStringLength(8, 4, '0FFF');
    }).toThrowError();
    expect(() => {
      validateHexStringLength(16, 0, 'FFF');
    }).toThrowError();
    expect(() => {
      validateHexStringLength(4, 4, 'F');
    }).toThrowError();
  });

  it('should handle edge cases correctly', () => {
    expect(() => {
      validateHexStringLength(0, 0, '');
    }).not.toThrow();
    expect(() => {
      validateHexStringLength(1, 1, '1');
    }).not.toThrow();
    expect(() => {
      validateHexStringLength(1, 1, '12');
    }).toThrowError();
  });
});
