export interface BinaryConversionStrategy {
  convert(
    binaryString: string,
    integerBits: number,
    fractionalBits: number,
  ): string;
}
