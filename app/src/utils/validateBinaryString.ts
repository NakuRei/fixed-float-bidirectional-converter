export function validateBinaryString(binaryString: string): void {
  if (!/^[01]+$/.test(binaryString)) {
    throw new Error('Binary string contains characters other than 0 and 1');
  }
}
