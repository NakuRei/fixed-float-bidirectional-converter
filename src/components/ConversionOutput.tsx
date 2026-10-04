import type { ConversionOutcome } from '../utils/convertFixedPoint';
import { ErrorDisplay } from './ErrorDisplay';
import { ResultDisplay } from './ResultDisplay';

interface ConversionOutputProps {
  isDecimalInput: boolean;
  outcome: ConversionOutcome;
}

const float64DescriptionId = 'float64Description';

const float64Descriptions = {
  rounded: 'Precision was lost converting the fixed-point value to Float64.',
  overflow: 'The fixed-point value is outside the Float64 range. '
    + 'Hexadecimal and binary results remain valid.',
};

function PrecisionNotices(
  { outcome }: Pick<ConversionOutputProps, 'outcome'>,
): React.JSX.Element | null {
  if (outcome.status !== 'success'
    || (!outcome.inputWasRounded
      && outcome.result.float64.status === 'exact')) {
    return null;
  }
  return (
    <div
      className={outcome.result.float64.status === 'overflow'
        ? 'text-sm mb-4'
        : 'sr-only'}
    >
      {outcome.inputWasRounded
        ? (
          <p className="sr-only">
            The decimal input was rounded to fit the fixed-point format.
          </p>
        )
        : null}

      {outcome.result.float64.status !== 'exact'
        ? (
          <p id={float64DescriptionId}>
            {float64Descriptions[outcome.result.float64.status]}
          </p>
        )
        : null}
    </div>
  );
}

export function ConversionOutput(
  { isDecimalInput, outcome }: ConversionOutputProps,
): React.JSX.Element {
  const fixedPointPrecision = outcome.status === 'success'
    && outcome.inputWasRounded
    ? 'Rounded'
    : 'Exact';
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

        <PrecisionNotices outcome={outcome} />
      </div>

      {outcome.status === 'success'
        ? (
          <ResultDisplay
            fixedPointPrecision={isDecimalInput
              ? fixedPointPrecision
              : undefined}
            float64DescriptionId={outcome.result.float64.status === 'exact'
              ? undefined
              : float64DescriptionId}
            result={outcome.result}
          />
        )
        : null}
    </div>
  );
}
