import type { ConversionResults } from '../conversion/convertFixedPoint';
import { InputFormat } from '../conversion/InputFormat';
import { ConversionResultRow } from './ConversionResultRow';

interface ConversionResultListProps {
  decimalDescriptionId: string | undefined;
  result: ConversionResults;
}

export function ConversionResultList({
  decimalDescriptionId,
  result,
}: ConversionResultListProps): React.JSX.Element {
  const original = {
    status: 'original',
    value: result.inputString,
  } as const;
  const { fixedPoint } = result;
  return (
    <div className="w-full grid gap-y-2">
      <ConversionResultRow
        descriptionId={undefined}
        label="Hexadecimal"
        result={result.inputFormat === InputFormat.Hexadecimal
          ? original
          : {
            status: fixedPoint.status,
            value: fixedPoint.hexadecimal,
          }}
      />

      <ConversionResultRow
        descriptionId={undefined}
        label="Binary"
        result={result.inputFormat === InputFormat.Binary
          ? original
          : {
            status: fixedPoint.status,
            value: fixedPoint.binary,
          }}
      />

      <ConversionResultRow
        descriptionId={decimalDescriptionId}
        label="Decimal"
        result={result.inputFormat === InputFormat.Decimal
          ? original
          : result.float64}
      />
    </div>
  );
}
