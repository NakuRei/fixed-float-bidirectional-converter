interface LabeledResultDisplayProps {
  label: string;
  result: string;
}

export function LabeledResultDisplay({
  label,
  result,
}: LabeledResultDisplayProps): React.JSX.Element {
  return (
    <div className={['w-full h-fit', 'grid grid-cols-12'].join(' ')}>
      <span
        className={['text-base text-gray-400', 'col-span-6 sm:col-span-3'].join(
          ' ',
        )}
      >
        {label}
      </span>

      <span
        className={[
          'text-xl font-bold text-on-primary-container',
          'break-all text-end',
          'col-span-6 sm:col-span-9',
        ].join(' ')}
      >
        {result}
      </span>
    </div>
  );
}
