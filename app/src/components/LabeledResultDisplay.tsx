interface LabeledResultDisplayProps {
  label: string;
  result: string;
}

export function LabeledResultDisplay({
  label,
  result,
}: LabeledResultDisplayProps): JSX.Element {
  return (
    <div
      className={[
        'w-full h-fit',
        'flex flex-row justify-between items-center',
        'text-on-background',
      ].join(' ')}
    >
      <span className="text-base text-gray-400">{label}</span>
      <span className="text-xl font-bold text-on-primary-container">
        {result}
      </span>
    </div>
  );
}
