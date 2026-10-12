import type { ConversionResults } from '../conversion/contracts';
import { ConversionResultRow } from './ConversionResultRow';

interface ConversionResultListProps {
  decimalDescriptionId: string | undefined;
  result: ConversionResults;
}

export function ConversionResultList({
  decimalDescriptionId,
  result,
}: ConversionResultListProps): React.JSX.Element {
  return (
    <div className="w-full grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2">
      <ConversionResultRow
        descriptionId={undefined}
        label="Hexadecimal"
        result={result.hexadecimal}
      />

      <ConversionResultRow
        descriptionId={undefined}
        label="Binary"
        result={result.binary}
      />

      <ConversionResultRow
        descriptionId={decimalDescriptionId}
        label="Decimal"
        result={result.decimal}
      />
    </div>
  );
}
