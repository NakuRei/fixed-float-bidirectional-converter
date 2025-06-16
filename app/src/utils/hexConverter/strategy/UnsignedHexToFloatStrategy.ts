import type { HexConversionStrategy } from '../HexConversionStrategy';
import { HexToBinaryStrategy } from './HexToBinaryStrategy';
import { UnsignedBinaryToFloatStrategy } from '../../binaryConverter/strategy/UnsignedBinaryToFloatStrategy';

export class UnsignedHexToFloatStrategy implements HexConversionStrategy {
  public convert(
    hexString: string,
    integerBits: number,
    fractionalBits: number,
  ): string {
    const binaryString = new HexToBinaryStrategy().convert(
      hexString,
      integerBits,
      fractionalBits,
    );
    return new UnsignedBinaryToFloatStrategy().convert(
      binaryString,
      integerBits,
      fractionalBits,
    );
  }
}
