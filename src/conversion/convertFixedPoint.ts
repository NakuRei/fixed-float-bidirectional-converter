import {
  InputFormat,
  type OverflowModeType,
  type BitPatternFormat,
  type ConversionInput,
  type ConversionOutcome,
  type RoundingModeType,
} from './contracts';
import { encodeDecimalFixedPoint, MAX_DECIMAL_BITS } from './encodeDecimalFixedPoint';
import { decodeFixedPointFloat64 } from './decodeFixedPointFloat64';
import { readFixedPointFormat, type FixedPointFormat } from './fixedPointFormat';
import {
  findForeignPrefixFormat,
  formatBitPattern,
  parseBitPattern,
} from './bitPatternNotation';
import { applyOverflow } from './applyOverflow';

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
      diagnostic: {
        code: 'total-bits-exceeded',
        inputFormat: input.inputFormat,
        maximum: MAX_DECIMAL_BITS,
        fields: ['integerBitsString', 'fractionalBitsString'],
      },
    };
  }
  if (reading.status === 'unsafe-total-bits') {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'total-bits-exceeded',
        inputFormat: input.inputFormat,
        maximum: Number.MAX_SAFE_INTEGER,
        fields: ['integerBitsString', 'fractionalBitsString'],
      },
    };
  }
  return reading;
}

function convertFixedPointPattern(
  inputString: string,
  inputFormat: BitPatternFormat,
  format: FixedPointFormat,
  overflowMode: OverflowModeType,
): ConversionOutcome {
  const pattern = parseBitPattern(
    inputString, inputFormat, format.totalBits, format.isSigned, overflowMode,
  );
  if (pattern.status === 'invalid') {
    return pattern;
  }
  const adjusted = applyOverflow(pattern.integer, format, overflowMode);
  if (adjusted.status === 'invalid') {
    return adjusted;
  }
  const { integer } = adjusted;
  const original = {
    status: 'original',
    value: inputString,
  } as const;
  return {
    status: 'success',
    overflowAction: adjusted.overflowAction,
    result: {
      hexadecimal: inputFormat === InputFormat.Hexadecimal
        ? original
        : {
          status: 'exact',
          value: formatBitPattern(
            integer, InputFormat.Hexadecimal, format.totalBits,
          ),
        },
      binary: inputFormat === InputFormat.Binary
        ? original
        : {
          status: 'exact',
          value: formatBitPattern(
            integer, InputFormat.Binary, format.totalBits,
          ),
        },
      decimal: decodeFixedPointFloat64(integer, format.fractionalBits),
    },
  };
}

function convertDecimalFixedPoint(
  inputString: string,
  format: FixedPointFormat,
  roundingMode: RoundingModeType,
  overflowMode: OverflowModeType,
): ConversionOutcome {
  const encoding = encodeDecimalFixedPoint(
    inputString,
    format,
    roundingMode,
    overflowMode,
  );
  if (encoding.status === 'invalid') {
    return encoding;
  }
  const status = encoding.inputWasRounded ? 'rounded' : 'exact';
  return {
    status: 'success',
    overflowAction: encoding.overflowAction,
    result: {
      hexadecimal: {
        status,
        value: formatBitPattern(
          encoding.integer, InputFormat.Hexadecimal, format.totalBits,
        ),
      },
      binary: {
        status,
        value: formatBitPattern(
          encoding.integer, InputFormat.Binary, format.totalBits,
        ),
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
  const prefixFormat = findForeignPrefixFormat(inputString, input.inputFormat);
  if (prefixFormat !== null) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'foreign-prefix',
        prefixFormat,
        fields: ['inputString'],
      },
    };
  }
  return input.inputFormat === InputFormat.Decimal
    ? convertDecimalFixedPoint(
      inputString, format, input.roundingMode, input.overflowMode,
    )
    : convertFixedPointPattern(
      inputString, input.inputFormat, format, input.overflowMode,
    );
}
