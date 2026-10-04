import type { ConversionResults } from '../types/ConversionResults';
import { LabeledResultDisplay } from '../components/LabeledResultDisplay';

interface ResultDisplayProps {
  float64DescriptionId: string;
  result: ConversionResults;
}

export function ResultDisplay(
  { float64DescriptionId, result }: ResultDisplayProps,
): React.JSX.Element {
  return (
    <>
      <LabeledResultDisplay
        label="Hexadecimal:"
        result={result.hexString}
      />

      <LabeledResultDisplay
        label="Binary:"
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
          result={result.float64.status === 'overflow'
            ? 'Out of range'
            : result.float64.value}
        />
      </div>
    </>
  );
}
