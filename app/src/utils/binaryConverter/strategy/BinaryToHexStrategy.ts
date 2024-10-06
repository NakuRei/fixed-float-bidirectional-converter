import type { BinaryConversionStrategy } from '../BinaryConversionStrategy';

export class BinaryToHexStrategy implements BinaryConversionStrategy {
  public convert(binaryString: string): string {
    // Split the binary string into 4-bit segments
    let hexStr = '';
    for (let i = binaryString.length; i > 0; i -= 4) {
      // Extract 4 bits (pad with leading zeros if necessary)
      const segment = binaryString
        .slice(Math.max(i - 4, 0), i)
        .padStart(4, '0');
      // Convert the 4-bit segment to hexadecimal and concatenate
      const hexSegment = parseInt(segment, 2).toString(16);
      hexStr = hexSegment + hexStr;
    }
    return hexStr.toUpperCase();
  }
}
