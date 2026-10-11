import { CopyButton } from './CopyButton';

type FormatResult = {
  readonly status: 'original' | 'exact' | 'rounded';
  readonly value: string;
} | {
  readonly status: 'overflow';
};

interface ConversionResultRowProps {
  descriptionId: string | undefined;
  label: string;
  result: FormatResult;
}

const statusLabels: Record<
  Exclude<FormatResult['status'], 'overflow'>,
  string
> = {
  original: 'original',
  exact: 'exact',
  rounded: 'rounded',
};

export function ConversionResultRow({
  descriptionId,
  label,
  result,
}: ConversionResultRowProps): React.JSX.Element {
  return (
    <div
      aria-describedby={descriptionId}
      aria-label={`${label} conversion`}
      className="w-full flex items-start gap-3"
      role="group"
    >
      <div
        className={[
          'w-full h-fit',
          'grid md:grid-cols-[auto_minmax(0,1fr)] gap-x-3',
        ].join(' ')}
      >
        <span className="text-base text-gray-400">
          {`${label}:`}
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
            {result.status === 'overflow' ? 'Out of range' : result.value}
          </span>

          {result.status === 'overflow'
            ? null
            : (
              <span className="text-xs text-on-background shrink-0 w-12">
                {statusLabels[result.status]}
              </span>
            )}
        </div>
      </div>

      <div className="w-8 shrink-0">
        {result.status === 'overflow'
          ? null
          : (
            <CopyButton
              key={result.value}
              label={label}
              value={result.value}
            />
          )}
      </div>
    </div>
  );
}
