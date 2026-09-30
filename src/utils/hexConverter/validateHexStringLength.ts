export function validateHexStringLength(
  integerBits: number,
  fractionalBits: number,
  hexString: string,
): void {
  const totalBits = integerBits + fractionalBits;

  const expectedLength
    = Math.floor(totalBits / 4) + (totalBits % 4 === 0 ? 0 : 1);
  if (hexString.length !== expectedLength) {
    throw new Error(
      `Hex string length should be ${
        expectedLength.toString()}, but got ${hexString.length.toString()}`,
    );
  }
}
