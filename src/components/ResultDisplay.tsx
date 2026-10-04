import type { ConversionResults } from '../types/ConversionResults';
import { LabeledResultDisplay } from '../components/LabeledResultDisplay';

interface ResultDisplayProps {
  fixedPointPrecision: 'Exact' | 'Rounded' | undefined;
  float64DescriptionId: string | undefined;
  result: ConversionResults;
}

const float64Precision = {
  exact: 'Exact',
  rounded: 'Rounded',
  overflow: undefined,
} as const;

export function ResultDisplay(
  { fixedPointPrecision, float64DescriptionId, result }: ResultDisplayProps,
): React.JSX.Element {
  return (
    <>
      <LabeledResultDisplay
        label="Hexadecimal:"
        precision={fixedPointPrecision}
        result={result.hexString}
      />

      <LabeledResultDisplay
        label="Binary:"
        precision={fixedPointPrecision}
        result={result.binaryString}
      />

      <div
        aria-describedby={float64DescriptionId}
        aria-label="Float64 conversion"
        className="w-full mt-4"
        role="group"
      >
        <LabeledResultDisplay
          label="Float64:"
          precision={float64Precision[result.float64.status]}
          result={result.float64.status === 'overflow'
            ? 'Out of range'
            : result.float64.value}
        />
      </div>
    </>
  );
}
