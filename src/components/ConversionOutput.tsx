import type { ConversionOutcome } from '../utils/convertFixedPoint';
import { ErrorDisplay } from './ErrorDisplay';
import { ResultDisplay } from './ResultDisplay';

interface ConversionOutputProps {
  outcome: ConversionOutcome;
}

const float64DescriptionId = 'float64Description';

const float64Descriptions = {
  exact: 'Float64 represents the fixed-point value exactly.',
  rounded: 'Precision was lost converting the fixed-point value to Float64.',
  overflow: 'The fixed-point value is outside the Float64 range. '
    + 'Hexadecimal and binary results remain valid.',
};

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

        {outcome.status === 'success'
          ? (
            <div className="text-sm mb-4">
              {outcome.inputWasRounded
                ? (
                  <p className="mb-2">
                    The decimal input was rounded to fit the fixed-point format.
                  </p>
                )
                : null}

              <p id={float64DescriptionId}>
                {float64Descriptions[outcome.result.float64.status]}
              </p>
            </div>
          )
          : null}
      </div>

      {outcome.status === 'success'
        ? (
          <ResultDisplay
            float64DescriptionId={float64DescriptionId}
            result={outcome.result}
          />
        )
        : null}
    </div>
  );
}
