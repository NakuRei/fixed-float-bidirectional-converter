import type { HexConversionStrategy } from '../HexConversionStrategy';

export class HexToHexStrategy implements HexConversionStrategy {
  public convert(hexString: string): string {
    return hexString;
  }
}
