import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay(
  { error }: ErrorDisplayProps,
): React.JSX.Element | null {
  if (error === null || error.trim() === '') {
    return null;
  }
  return (
    <div
      className={[
        'w-full h-fit',
        'flex flex-col justify-start items-center',
        'px-4 py-2',
        'bg-error-container',
        'text-error',
      ].join(' ')}
    >
      <p className="text-sm">ERROR:</p>
      <p className="text-base">{error}</p>
    </div>
  );
}
