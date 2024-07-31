export function invertBinaryString(binaryString: string): string {
  const totalBits = binaryString.length;
  let invertedBinary = '';
  for (let i = 0; i < totalBits; i++) {
    invertedBinary += binaryString[i] === '0' ? '1' : '0';
  }
  return invertedBinary;
}
