interface ErrorDisplayProps {
  id: string;
  error: string;
}

export function ErrorDisplay(
  { id, error }: ErrorDisplayProps,
): React.JSX.Element {
  return (
    <div
      className={[
        'w-full h-fit',
        'flex flex-col justify-start items-center',
        'px-4 py-2',
        'bg-error-container',
        'text-error',
      ].join(' ')}
      id={id}
    >
      <p className="text-sm">ERROR:</p>
      <p className="text-base">{error}</p>
    </div>
  );
}
