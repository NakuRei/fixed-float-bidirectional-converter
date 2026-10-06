import type { ConversionResults } from '../types/ConversionResults';
import { LabeledResultDisplay } from '../components/LabeledResultDisplay';

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
      label: 'Hex',
      result: result.hex,
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
          className="w-full"
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
        </div>
      ))}
    </div>
  );
}
