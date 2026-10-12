import { useId } from 'react';

import type {
  ConversionOutcome,
  ConversionResults,
} from '../conversion/contracts';
import { ConversionErrorMessage } from './ConversionErrorMessage';
import { ConversionResultList } from './ConversionResultList';

interface ConversionOutcomePanelProps {
  errorId: string;
  outcome: ConversionOutcome;
}

type Float64PrecisionLoss = 'rounded' | 'overflow';

interface PrecisionNoticesProps {
  float64PrecisionLoss: Float64PrecisionLoss | null;
  float64PrecisionLossDescriptionId: string;
  inputWasRounded: boolean;
}

const float64PrecisionLossDescriptions = {
  rounded: 'Precision was lost converting the fixed-point value to Float64.',
  overflow: 'The fixed-point value is outside the Float64 range. '
    + 'Hexadecimal and binary results remain valid.',
};

function findFloat64PrecisionLoss(
  decimal: ConversionResults['decimal'],
): Float64PrecisionLoss | null {
  return decimal.status === 'original' || decimal.status === 'exact'
    ? null
    : decimal.status;
}

function PrecisionNotices({
  float64PrecisionLoss,
  float64PrecisionLossDescriptionId,
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
          <p id={float64PrecisionLossDescriptionId}>
            {float64PrecisionLossDescriptions[float64PrecisionLoss]}
          </p>
        )
        : null}
    </div>
  );
}

export function ConversionOutcomePanel(
  { errorId, outcome }: ConversionOutcomePanelProps,
): React.JSX.Element {
  const float64PrecisionLoss = outcome.status === 'success'
    ? findFloat64PrecisionLoss(outcome.result.decimal)
    : null;
  const float64PrecisionLossDescriptionId = useId();

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
            <ConversionErrorMessage
              id={errorId}
              message={outcome.message}
            />
          )
          : null}

        {outcome.status === 'success'
          ? (
            <PrecisionNotices
              float64PrecisionLoss={float64PrecisionLoss}
              float64PrecisionLossDescriptionId={
                float64PrecisionLossDescriptionId
              }
              inputWasRounded={outcome.result.hexadecimal.status === 'rounded'}
            />
          )
          : null}
      </div>

      {outcome.status === 'success'
        ? (
          <ConversionResultList
            decimalDescriptionId={float64PrecisionLoss === null
              ? undefined
              : float64PrecisionLossDescriptionId}
            result={outcome.result}
          />
        )
        : null}
    </div>
  );
}
