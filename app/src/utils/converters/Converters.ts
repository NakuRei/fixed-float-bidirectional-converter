import type { Converter } from '../Converter';
import type { ConversionResults } from '../../types/ConversionResults';

export class Converters {
  public constructor(
    private readonly toHexConverter: Converter,
    private readonly toFloatConverter: Converter,
    private readonly toBinaryConverter: Converter,
  ) {}

  public convert(
    inputString: string,
    integerBits: number,
    fractionalBits: number,
  ): ConversionResults {
    const hexString = this.toHexConverter.convert(
      inputString,
      integerBits,
      fractionalBits,
    );
    const floatString = this.toFloatConverter.convert(
      inputString,
      integerBits,
      fractionalBits,
    );
    const binaryString = this.toBinaryConverter.convert(
      inputString,
      integerBits,
      fractionalBits,
    );
    return {
      hexString,
      floatString,
      binaryString,
    };
  }
}
