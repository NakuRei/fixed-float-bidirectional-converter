import type { ConversionResults } from '../conversion/convertFixedPoint';
import { CopyButton } from './CopyButton';
import { LabeledResultDisplay } from './LabeledResultDisplay';

interface ResultDisplayProps {
  decimalDescriptionId: string | undefined;
  result: ConversionResults;
}

const precisionLabels = {
  original: 'original',
  exact: 'Exact',
  rounded: 'rounded',
  overflow: undefined,
} as const;

export function ResultDisplay({
  decimalDescriptionId,
  result,
}: ResultDisplayProps): React.JSX.Element {
  const rows = [
    {
      label: 'Hexadecimal',
      result: result.hexadecimal,
      descriptionId: undefined,
    },
    {
      label: 'Binary',
      result: result.binary,
      descriptionId: undefined,
    },
    {
      label: 'Decimal',
      result: result.decimal,
      descriptionId: decimalDescriptionId,
    },
  ];
  return (
    <div className="w-full grid gap-y-2">
      {rows.map((row) => (
        <div
          aria-describedby={row.descriptionId}
          aria-label={`${row.label} conversion`}
          className="w-full flex items-start gap-3"
          key={row.label}
          role="group"
        >
          <LabeledResultDisplay
            label={`${row.label}:`}
            precision={precisionLabels[row.result.status]}
            result={row.result.status === 'overflow'
              ? 'Out of range'
              : row.result.value}
          />

          <div className="w-8 shrink-0">
            {row.result.status === 'overflow'
              ? null
              : (
                <CopyButton
                  key={row.result.value}
                  label={row.label}
                  value={row.result.value}
                />
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
