import type { HexConversionStrategy } from '../HexConversionStrategy';

export class HexToBinaryStrategy implements HexConversionStrategy {
  public convert(
    hexString: string,
    integerBits: number,
    fractionalBits: number,
  ): string {
    const binaryString = hexString
      .split('')
      .map((hexChar) => parseInt(hexChar, 16).toString(2)
        .padStart(4, '0'))
      .join('')
      .slice(-(integerBits + fractionalBits));
    return binaryString;
  }
}
