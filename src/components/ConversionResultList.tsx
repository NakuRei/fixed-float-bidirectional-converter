import type { ConversionResults, OverflowAction } from '../conversion/contracts';
import { ConversionResultRow } from './ConversionResultRow';

interface ConversionResultListProps {
  decimalDescriptionId: string | undefined;
  result: ConversionResults;
  overflowAction: OverflowAction | undefined;
}

export function ConversionResultList({
  decimalDescriptionId,
  result,
  overflowAction,
}: ConversionResultListProps): React.JSX.Element {
  return (
    <div className="w-full grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2">
      <ConversionResultRow
        descriptionId={undefined}
        label="Hexadecimal"
        result={result.hexadecimal}
        overflowAction={overflowAction}
      />

      <ConversionResultRow
        descriptionId={undefined}
        label="Binary"
        result={result.binary}
        overflowAction={overflowAction}
      />

      <ConversionResultRow
        descriptionId={decimalDescriptionId}
        label="Decimal"
        result={result.decimal}
        overflowAction={overflowAction}
      />
    </div>
  );
}
