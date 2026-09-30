export function addOneWithCarry(binaryString: string): string {
  const totalBits = binaryString.length;
  let carry = 1;
  let result = '';
  for (let i = totalBits - 1; i >= 0; i--) {
    const sum = (binaryString[i] === '1' ? 1 : 0) + carry;
    result = (sum % 2).toString() + result;
    carry = Math.floor(sum / 2);
  }
  return result;
}
