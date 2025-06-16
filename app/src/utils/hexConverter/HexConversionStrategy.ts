export interface HexConversionStrategy {
  convert: (
    hexString: string,
    integerBits: number,
    fractionalBits: number,
  ) => string;
}
