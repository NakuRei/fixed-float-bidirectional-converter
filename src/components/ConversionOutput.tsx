import type {
  ConversionOutcome,
  ConversionResults,
} from '../conversion/convertFixedPoint';
import { ErrorDisplay } from './ErrorDisplay';
import { ResultDisplay } from './ResultDisplay';

interface ConversionOutputProps {
  outcome: ConversionOutcome;
}

type Float64PrecisionLoss = 'rounded' | 'overflow';

interface PrecisionNoticesProps {
  float64PrecisionLoss: Float64PrecisionLoss | null;
  inputWasRounded: boolean;
}

const decimalDescriptionId = 'decimalDescription';

const decimalDescriptions = {
  rounded: 'Precision was lost converting the fixed-point value to Float64.',
  overflow: 'The fixed-point value is outside the Float64 range. '
    + 'Hexadecimal and binary results remain valid.',
};

function findFloat64PrecisionLoss(
  result: ConversionResults,
): Float64PrecisionLoss | null {
  return 'float64' in result && result.float64.status !== 'exact'
    ? result.float64.status
    : null;
}

function PrecisionNotices({
  float64PrecisionLoss,
  inputWasRounded,
}: PrecisionNoticesProps): React.JSX.Element | null {
  if (!inputWasRounded && float64PrecisionLoss === null) {
    return null;
  }
  return (
    <div
      className={float64PrecisionLoss === 'overflow'
        ? 'text-sm mb-4'
        : 'sr-only'}
    >
      {inputWasRounded
        ? (
          <p className="sr-only">
            The decimal input was rounded to fit the fixed-point format.
          </p>
        )
        : null}

      {float64PrecisionLoss !== null
        ? (
          <p id={decimalDescriptionId}>
            {decimalDescriptions[float64PrecisionLoss]}
          </p>
        )
        : null}
    </div>
  );
}

export function ConversionOutput(
  { outcome }: ConversionOutputProps,
): React.JSX.Element {
  const float64PrecisionLoss = outcome.status === 'success'
    ? findFloat64PrecisionLoss(outcome.result)
    : null;
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

        {outcome.status === 'success'
          ? (
            <PrecisionNotices
              float64PrecisionLoss={float64PrecisionLoss}
              inputWasRounded={outcome.result.fixedPoint.status === 'rounded'}
            />
          )
          : null}
      </div>

      {outcome.status === 'success'
        ? (
          <ResultDisplay
            decimalDescriptionId={float64PrecisionLoss === null
              ? undefined
              : decimalDescriptionId}
            result={outcome.result}
          />
        )
        : null}
    </div>
  );
}
