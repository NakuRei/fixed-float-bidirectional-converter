import type { Converter } from '../Converter';
import type { HexConversionStrategy } from './HexConversionStrategy';
import { validateHexString } from './validateHexString';
import { validateHexStringLength } from './validateHexStringLength';

export class HexConverter implements Converter {
  private strategy: HexConversionStrategy;

  public constructor(strategy: HexConversionStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: HexConversionStrategy): void {
    this.strategy = strategy;
  }

  // Main conversion method
  public convert(
    hexString: string,
    integerBits: number,
    fractionalBits: number,
  ): string {
    this.validateInput(hexString, integerBits, fractionalBits);
    return this.strategy.convert(hexString, integerBits, fractionalBits);
  }

  // common validation method
  private validateInput(
    hexString: string,
    integerBits: number,
    fractionalBits: number,
  ): void {
    validateHexString(hexString);
    validateHexStringLength(integerBits, fractionalBits, hexString);
  }
}
