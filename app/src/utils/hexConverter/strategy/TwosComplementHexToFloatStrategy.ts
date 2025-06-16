import type { HexConversionStrategy } from '../HexConversionStrategy';
import { HexToBinaryStrategy } from './HexToBinaryStrategy';
import { TwosComplementBinaryToFloatStrategy } from '../../binaryConverter/strategy/TwosComplementBinaryToFloatStrategy';

export class TwosComplementHexToFloatStrategy implements HexConversionStrategy {
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
    return new TwosComplementBinaryToFloatStrategy().convert(
      binaryString,
      integerBits,
      fractionalBits,
    );
  }
}
