import type { ConversionOutcome } from '../utils/convertFixedPoint';
import { ErrorDisplay } from './ErrorDisplay';
import { ResultDisplay } from './ResultDisplay';

interface ConversionOutputProps {
  outcome: ConversionOutcome;
}

const decimalDescriptionId = 'decimalDescription';

const decimalDescriptions = {
  rounded: 'Precision was lost converting the fixed-point value to Float64.',
  overflow: 'The fixed-point value is outside the Float64 range. '
    + 'Hexadecimal and binary results remain valid.',
};

function PrecisionNotices(
  { outcome }: ConversionOutputProps,
): React.JSX.Element | null {
  if (outcome.status !== 'success') {
    return null;
  }
  const fixedPointWasRounded = outcome.result.hex.status === 'rounded'
    || outcome.result.binary.status === 'rounded';
  const decimalStatus = outcome.result.decimal.status;
  const decimalNotice = decimalStatus === 'rounded'
    || decimalStatus === 'overflow'
    ? decimalDescriptions[decimalStatus]
    : null;
  if (!fixedPointWasRounded && decimalNotice === null) {
    return null;
  }
  return (
    <div
      className={outcome.result.decimal.status === 'overflow'
        ? 'text-sm mb-4'
        : 'sr-only'}
    >
      {fixedPointWasRounded
        ? (
          <p className="sr-only">
            The decimal input was rounded to fit the fixed-point format.
          </p>
        )
        : null}

      {decimalNotice !== null
        ? (
          <p id={decimalDescriptionId}>
            {decimalNotice}
          </p>
        )
        : null}
    </div>
  );
}

export function ConversionOutput(
  { outcome }: ConversionOutputProps,
): React.JSX.Element {
  return (
    <div
      className={outcome.status === 'empty'
        ? 'sr-only'
        : [
          'w-full h-fit',
          outcome.status === 'success'
            ? 'px-4 py-2 bg-primary-900/40 text-on-background overflow-x-auto'
            : '',
        ].join(' ')}
    >
      {outcome.status === 'success'
        ? <h2 className="text-xl font-bold text-center mb-4">Result</h2>
        : null}

      <div
        aria-atomic="true"
        role="status"
      >
        {outcome.status === 'invalid'
          ? (
            <ErrorDisplay
              error={outcome.message}
              id="conversionError"
            />
          )
          : null}

        <PrecisionNotices
          outcome={outcome}
        />
      </div>

      {outcome.status === 'success'
        ? (
          <ResultDisplay
            decimalDescriptionId={outcome.result.decimal.status === 'original'
              || outcome.result.decimal.status === 'exact'
              ? undefined
              : decimalDescriptionId}
            result={outcome.result}
          />
        )
        : null}
    </div>
  );
}
