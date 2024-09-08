import { BinaryConversionStrategy } from '../BinaryConversionStrategy';
import { UnsignedBinaryToFloatStrategy } from './UnsignedBinaryToFloatStrategy';
import { invertBinaryString } from '../../invertBinaryString';
import { addOneWithCarry } from '../../addOneWithCarry';

export class TwosComplementBinaryToFloatStrategy
  implements BinaryConversionStrategy
{
  public convert(
    binaryString: string,
    integerBits: number,
    fractionalBits: number,
  ): string {
    const isNegative = binaryString.startsWith('1');

    if (isNegative) {
      const invertedBinary = invertBinaryString(binaryString);
      binaryString = addOneWithCarry(invertedBinary);
    }

    const unsignedStrategy = new UnsignedBinaryToFloatStrategy();
    const value = unsignedStrategy.convert(
      binaryString,
      integerBits,
      fractionalBits,
    );

    return isNegative ? (-value).toString() : value.toString();
  }
}
