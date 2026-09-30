import { describe, it, expect } from 'vitest';

import { invertBinaryString } from '../../src/utils/invertBinaryString';

describe('invertBinaryString', () => {
  it('should invert the binary string correctly', () => {
    expect(invertBinaryString('01010100')).toBe('10101011');
    expect(invertBinaryString('0110101')).toBe('1001010');
    expect(invertBinaryString('01101')).toBe('10010');
  });
});
