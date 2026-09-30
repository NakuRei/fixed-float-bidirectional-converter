import type { BinaryConversionStrategy } from '../BinaryConversionStrategy';

export class UnsignedBinaryToFloatStrategy implements BinaryConversionStrategy {
  public convert(
    binaryString: string,
    integerBits: number,
    fractionalBits: number,
  ): string {
    let value = 0;
    // process integer part
    for (let i = 0; i < integerBits; i++) {
      value += parseInt(binaryString[i], 10) * (2 ** (integerBits - i - 1));
    }
    // process fractional part
    for (let i = 0; i < fractionalBits; i++) {
      value += parseInt(binaryString[integerBits + i], 10) * (2 ** -(i + 1));
    }
    return value.toString();
  }
}
