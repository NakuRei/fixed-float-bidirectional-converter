import { Converter } from '../Converter';
import { ConversionResults } from '../../types/ConversionResults';

export class Converters {
  public constructor(
    private readonly toFloatConverter: Converter,
    private readonly toHexConverter: Converter,
  ) {}

  public convert(
    inputString: string,
    integerBits: number,
    fractionalBits: number,
  ): ConversionResults {
    const floatString = this.toFloatConverter.convert(
      inputString,
      integerBits,
      fractionalBits,
    );
    const hexString = this.toHexConverter.convert(
      inputString,
      integerBits,
      fractionalBits,
    );
    return { floatString, hexString };
  }
}
