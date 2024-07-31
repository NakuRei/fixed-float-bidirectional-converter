import { describe, it, expect } from 'vitest';

import { addOneWithCarry } from '../../src/utils/addOneWithCarry';

describe('addOneWithCarry', () => {
  it('should correctly add one to the binary string', () => {
    expect(addOneWithCarry('01010100')).toBe('01010101');
    expect(addOneWithCarry('0110101')).toBe('0110110');
    expect(addOneWithCarry('01101')).toBe('01110');
  });

  it('should handle edge cases', () => {
    expect(addOneWithCarry('1111')).toBe('0000');
    expect(addOneWithCarry('11')).toBe('00');
    expect(addOneWithCarry('1')).toBe('0');
    expect(addOneWithCarry('0')).toBe('1');
  });
});
