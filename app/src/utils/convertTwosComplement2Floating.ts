export function convertTwosComplementBinary2Floating(
  binaryString: string,
  integerBits: number,
  fractionalBits: number,
): number {
  // バイナリ文字列の長さが指定されたビット数と一致しているかチェック
  const totalBits = integerBits + fractionalBits;
  if (binaryString.length !== totalBits) {
    throw new Error(
      'Binary string length does not match the specified number of bits',
    );
  }

  // 0と1以外の文字が含まれているかチェック
  if (!/^[01]+$/.test(binaryString)) {
    throw new Error('Binary string contains characters other than 0 and 1');
  }

  // 符号ビットの処理
  const isNegative = binaryString.startsWith('1');
  let value = 0;

  // 負の数の場合、ビット反転して1を加える
  if (isNegative) {
    // ビット反転
    let invertedBinary = '';
    for (let i = 0; i < totalBits; i++) {
      invertedBinary += binaryString[i] === '0' ? '1' : '0';
    }

    // 1を加える (最下位ビットから)
    let carry = 1;
    let result = '';
    for (let i = totalBits - 1; i >= 0; i--) {
      const sum = (invertedBinary[i] === '1' ? 1 : 0) + carry;
      result = (sum % 2).toString() + result;
      carry = Math.floor(sum / 2);
    }
    binaryString = result;
  }

  // 整数部分の処理
  for (let i = 0; i < integerBits; i++) {
    value += parseInt(binaryString[i]) * Math.pow(2, integerBits - i - 1);
  }

  // 小数部分の処理
  for (let i = 0; i < fractionalBits; i++) {
    value += parseInt(binaryString[integerBits + i]) * Math.pow(2, -(i + 1));
  }

  return isNegative ? -value : value;
}
