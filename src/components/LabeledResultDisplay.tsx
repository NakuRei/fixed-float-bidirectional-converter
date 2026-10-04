interface LabeledResultDisplayProps {
  label: string;
  precision: 'Exact' | 'Rounded' | undefined;
  result: string;
}

export function LabeledResultDisplay({
  label,
  precision,
  result,
}: LabeledResultDisplayProps): React.JSX.Element {
  return (
    <div
      className={[
        'w-full h-fit',
        'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3',
      ].join(' ')}
    >
      <span className="text-base text-gray-400">
        {label}
      </span>

      <div
        className="flex items-baseline justify-end gap-3 min-w-0"
      >
        <span
          className={[
            'text-xl font-bold text-on-primary-container',
            'break-all text-end min-w-0',
          ].join(' ')}
        >
          {result}
        </span>

        {precision !== undefined
          ? (
            <span className="text-xs text-on-background shrink-0 w-12">
              {precision}
            </span>
          )
          : null}
      </div>
    </div>
  );
}
