export function convertUnsignedBinaryStringToFloat(
  binaryString: string,
  integerBits: number,
  fractionalBits: number,
): number {
  let value = 0;

  // 整数部分の処理
  for (let i = 0; i < integerBits; i++) {
    value += parseInt(binaryString[i]) * Math.pow(2, integerBits - i - 1);
  }

  // 小数部分の処理
  for (let i = 0; i < fractionalBits; i++) {
    value += parseInt(binaryString[integerBits + i]) * Math.pow(2, -(i + 1));
  }
  return value;
}
