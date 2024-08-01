export function validateBinaryStringLength(
  integerBits: number,
  fractionalBits: number,
  binaryString: string,
): number {
  const totalBits = integerBits + fractionalBits;
  if (binaryString.length !== totalBits) {
    throw new Error(
      'Binary string length does not match the specified number of bits',
    );
  }
  return totalBits;
}
