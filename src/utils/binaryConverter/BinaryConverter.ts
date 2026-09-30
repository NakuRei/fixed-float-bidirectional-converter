import type { Converter } from '../Converter';
import type { BinaryConversionStrategy } from './BinaryConversionStrategy';
import { validateBinaryStringLength } from './validateBinaryStringLength';
import { validateBinaryString } from './validateBinaryString';

export class BinaryConverter implements Converter {
  private strategy: BinaryConversionStrategy;

  public constructor(strategy: BinaryConversionStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: BinaryConversionStrategy): void {
    this.strategy = strategy;
  }

  // Main conversion method
  public convert(
    binaryString: string,
    integerBits: number,
    fractionalBits: number,
  ): string {
    this.validateInput(binaryString, integerBits, fractionalBits);
    return this.strategy.convert(binaryString, integerBits, fractionalBits);
  }

  // common validation method
  private validateInput(
    binaryString: string,
    integerBits: number,
    fractionalBits: number,
  ): void {
    validateBinaryString(binaryString);
    validateBinaryStringLength(integerBits, fractionalBits, binaryString);
  }
}
