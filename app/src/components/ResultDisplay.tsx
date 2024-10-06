import React from 'react';

import type { ConversionResults } from '../types/ConversionResults';
import { LabeledResultDisplay } from '../components/LabeledResultDisplay';

interface ResultDisplayProps {
  result: ConversionResults | null;
}

export function ResultDisplay(
  { result }: ResultDisplayProps,
): React.JSX.Element | null {
  if (result === null) {
    return null;
  }
  return (
    <div
      className={[
        'w-full h-fit',
        'flex flex-col justify-start items-center',
        'px-4 py-2',
        'bg-primary-900 bg-opacity-40',
        'text-on-background',
        'overflow-x-auto',
      ].join(' ')}
    >
      <h2 className="text-xl font-bold mb-4">Result</h2>

      <LabeledResultDisplay
        label="Hexadecimal:"
        result={result.hexString}
      />

      <LabeledResultDisplay
        label="Floating:"
        result={result.floatString}
      />

      <LabeledResultDisplay
        label="Binary:"
        result={result.binaryString}
      />
    </div>
  );
}
