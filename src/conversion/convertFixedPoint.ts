import {
  InputFormat,
  type BitPatternFormat,
  type ConversionInput,
  type ConversionOutcome,
  type RoundingModeType,
} from './contracts';
import { encodeDecimalFixedPoint, MAX_DECIMAL_BITS } from './encodeDecimalFixedPoint';
import { decodeFixedPointFloat64 } from './decodeFixedPointFloat64';
import { readFixedPointFormat, type FixedPointFormat } from './fixedPointFormat';
import {
  findForeignPrefixMessage,
  parseBitPattern,
} from './parseInputNotation';

type ConversionFormatReading = {
  status: 'valid';
  format: FixedPointFormat;
} | Extract<ConversionOutcome, { status: 'invalid' }>;

function readConversionFormat(input: ConversionInput): ConversionFormatReading {
  const reading = readFixedPointFormat({
    integerBitsString: input.integerBitsString,
    fractionalBitsString: input.fractionalBitsString,
    isSigned: input.isSigned,
  });
  if (reading.status === 'invalid') {
    return reading;
  }
  if (input.inputFormat === InputFormat.Decimal
    && (reading.status === 'unsafe-total-bits'
      || reading.format.totalBits > MAX_DECIMAL_BITS)) {
    return {
      status: 'invalid',
      message: 'Decimal conversion supports at most '
        + `${MAX_DECIMAL_BITS.toString()} total bits.`,
      invalidFields: ['integerBitsString', 'fractionalBitsString'],
    };
  }
  if (reading.status === 'unsafe-total-bits') {
    return {
      status: 'invalid',
      message: 'Total bit count is too large.',
      invalidFields: ['integerBitsString', 'fractionalBitsString'],
    };
  }
  return reading;
}

function toHexString(binaryString: string, isSigned: boolean): string {
  const paddingBit = isSigned && binaryString.startsWith('1') ? '1' : '0';
  let hexString = '';
  for (let end = binaryString.length; end > 0; end -= 4) {
    const segment = binaryString.slice(Math.max(end - 4, 0), end)
      .padStart(4, paddingBit);
    hexString = parseInt(segment, 2).toString(16) + hexString;
  }
  return hexString.toUpperCase();
}

function convertFixedPointPattern(
  inputString: string,
  inputFormat: BitPatternFormat,
  format: FixedPointFormat,
): ConversionOutcome {
  const pattern = parseBitPattern(
    inputString,
    inputFormat,
    format.totalBits,
  );
  if (pattern.status === 'invalid') {
    return {
      status: 'invalid',
      message: pattern.message,
      invalidFields: ['inputString'],
    };
  }
  const { binaryString } = pattern;
  const original = {
    status: 'original',
    value: inputString,
  } as const;
  return {
    status: 'success',
    result: {
      hexadecimal: inputFormat === InputFormat.Hexadecimal
        ? original
        : {
          status: 'exact',
          value: toHexString(binaryString, format.isSigned),
        },
      binary: inputFormat === InputFormat.Binary
        ? original
        : {
          status: 'exact',
          value: binaryString,
        },
      decimal: decodeFixedPointFloat64(binaryString, format),
    },
  };
}

function convertDecimalFixedPoint(
  inputString: string,
  format: FixedPointFormat,
  roundingMode: RoundingModeType,
): ConversionOutcome {
  const encoding = encodeDecimalFixedPoint(
    inputString,
    format,
    roundingMode,
  );
  if (encoding.status === 'invalid') {
    return {
      ...encoding,
      invalidFields: ['inputString'],
    };
  }
  const status = encoding.inputWasRounded ? 'rounded' : 'exact';
  return {
    status: 'success',
    result: {
      hexadecimal: {
        status,
        value: toHexString(encoding.binaryString, format.isSigned),
      },
      binary: {
        status,
        value: encoding.binaryString,
      },
      decimal: {
        status: 'original',
        value: inputString,
      },
    },
  };
}

export function convertFixedPoint(input: ConversionInput): ConversionOutcome {
  const formatReading = readConversionFormat(input);
  if (formatReading.status === 'invalid') {
    return formatReading;
  }
  const { format } = formatReading;
  // Pasted values often carry surrounding whitespace or line breaks.
  const inputString = input.inputString.trim();
  if (inputString === '') {
    return { status: 'empty' };
  }
  const foreignPrefixMessage = findForeignPrefixMessage(
    inputString,
    input.inputFormat,
  );
  if (foreignPrefixMessage !== null) {
    return {
      status: 'invalid',
      message: foreignPrefixMessage,
      invalidFields: ['inputString'],
    };
  }
  return input.inputFormat === InputFormat.Decimal
    ? convertDecimalFixedPoint(inputString, format, input.roundingMode)
    : convertFixedPointPattern(inputString, input.inputFormat, format);
}
