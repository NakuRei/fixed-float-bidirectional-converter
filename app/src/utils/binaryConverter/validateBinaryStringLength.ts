export function validateBinaryStringLength(
  integerBits: number,
  fractionalBits: number,
  binaryString: string,
): number {
  const totalBits = integerBits + fractionalBits;
  if (binaryString.length !== totalBits) {
    throw new Error(
      `Binary string length should be ${totalBits.toString()}, but got ${binaryString.length.toString()}`,
    );
  }
  return totalBits;
}
