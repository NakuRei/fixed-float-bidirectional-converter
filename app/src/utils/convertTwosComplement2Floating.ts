import { validateBinaryStringLength } from './validateBinaryStringLength';
import { validateBinaryString } from './validateBinaryString';
import { invertBinaryString } from './invertBinaryString';
import { addOneWithCarry } from './addOneWithCarry';
import { convertUnsignedBinaryStringToFloat } from './convertUnsignedBinaryStringToFloat';

export function convertTwosComplementBinary2Floating(
  binaryString: string,
  integerBits: number,
  fractionalBits: number,
): number {
  validateBinaryStringLength(integerBits, fractionalBits, binaryString);
  validateBinaryString(binaryString);

  const isNegative = binaryString.startsWith('1');

  if (isNegative) {
    const invertedBinary = invertBinaryString(binaryString);
    binaryString = addOneWithCarry(invertedBinary);
  }

  const value = convertUnsignedBinaryStringToFloat(
    binaryString,
    integerBits,
    fractionalBits,
  );

  return isNegative ? -value : value;
}
