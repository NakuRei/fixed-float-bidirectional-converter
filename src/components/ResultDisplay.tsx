import type { ConversionResults } from '../types/ConversionResults';
import { LabeledResultDisplay } from '../components/LabeledResultDisplay';

interface ResultDisplayProps {
  inputWasRounded: boolean;
  result: ConversionResults;
}

const float64Descriptions = {
  exact: 'Float64 represents the fixed-point value exactly.',
  rounded: 'Precision was lost converting the fixed-point value to Float64.',
  overflow: 'The fixed-point value is outside the Float64 range. '
    + 'Hexadecimal and binary results remain valid.',
};

export function ResultDisplay(
  { inputWasRounded, result }: ResultDisplayProps,
): React.JSX.Element {
  return (
    <div
      className={[
        'w-full h-fit',
        'flex flex-col justify-start items-center',
        'px-4 py-2',
        'bg-primary-900/40',
        'text-on-background',
        'overflow-x-auto',
      ].join(' ')}
    >
      <h2 className="text-xl font-bold mb-4">Result</h2>

      {inputWasRounded
        ? (
          <p className="text-sm mb-4">
            The decimal input was rounded to fit the fixed-point format.
          </p>
        )
        : null}

      <LabeledResultDisplay
        label="Hexadecimal:"
        result={result.hexString}
      />

      <LabeledResultDisplay
        label="Binary:"
        result={result.binaryString}
      />

      <div
        aria-describedby="float64Description"
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

        <p
          className="text-sm mt-2"
          id="float64Description"
        >
          {float64Descriptions[result.float64.status]}
        </p>
      </div>
    </div>
  );
}
