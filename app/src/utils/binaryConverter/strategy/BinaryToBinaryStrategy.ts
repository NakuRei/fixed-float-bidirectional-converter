import { BinaryConversionStrategy } from '../BinaryConversionStrategy';

export class BinaryToBinaryStrategy implements BinaryConversionStrategy {
  public convert(binaryString: string): string {
    return binaryString;
  }
}
