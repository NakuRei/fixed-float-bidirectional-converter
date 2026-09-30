export function validateHexString(hexString: string): void {
  if (!(/^[0-9A-Fa-f]+$/u).test(hexString)) {
    throw new Error('Hex string contains characters other than 0-9 and A-F');
  }
}
