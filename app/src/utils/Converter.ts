export interface Converter {
  convert: (
    inputString: string,
    integerBits: number,
    fractionalBits: number,
  ) => string;
}
