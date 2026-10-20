import {
  OverflowMode,
  type OverflowModeType,
  type OverflowAction,
  type ConversionDiagnostic,
} from './contracts';
import { fixedPointIntegerRange, type FixedPointFormat } from './fixedPointFormat';

export function applyOverflow(
  integer: bigint,
  format: FixedPointFormat,
  mode: OverflowModeType,
): {
  status: 'success';
  integer: bigint;
  overflowAction?: OverflowAction;
} | {
  status: 'invalid';
  diagnostic: Extract<ConversionDiagnostic, { code: 'out-of-range' }>;
} {
  const { minimum, maximum } = fixedPointIntegerRange(format);
  if (integer >= minimum && integer <= maximum) {
    return {
      status: 'success',
      integer,
    };
  }
  if (mode === OverflowMode.Error) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'out-of-range',
        fields: ['inputString'],
      },
    };
  }
  if (mode === OverflowMode.Saturate) {
    return {
      status: 'success',
      integer: integer < minimum ? minimum : maximum,
      overflowAction: 'saturated',
    };
  }
  return {
    status: 'success',
    integer: format.isSigned
      ? BigInt.asIntN(format.totalBits, integer)
      : BigInt.asUintN(format.totalBits, integer),
    overflowAction: 'wrapped',
  };
}
