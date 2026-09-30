import type { BinaryConversionStrategy } from '../BinaryConversionStrategy';
import { UnsignedBinaryToFloatStrategy } from './UnsignedBinaryToFloatStrategy';
import { invertBinaryString } from '../../invertBinaryString';
import { addOneWithCarry } from '../../addOneWithCarry';

export class TwosComplementBinaryToFloatStrategy
implements BinaryConversionStrategy {
  public convert(
    binaryString: string,
    integerBits: number,
    fractionalBits: number,
  ): string {
    const isNegative = binaryString.startsWith('1');
    let processedBinaryString = binaryString;

    if (isNegative) {
      const invertedBinary = invertBinaryString(binaryString);
      processedBinaryString = addOneWithCarry(invertedBinary);
    }

    const unsignedStrategy = new UnsignedBinaryToFloatStrategy();
    const value = unsignedStrategy.convert(
      processedBinaryString,
      integerBits,
      fractionalBits,
    );

    return isNegative
      ? (-1 * parseFloat(value)).toString()
      : value.toString();
  }
}
