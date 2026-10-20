import type { ConversionResults, OverflowAction } from '../conversion/contracts';
import { CopyButton } from './CopyButton';

type NotationResult = ConversionResults[keyof ConversionResults];

interface ConversionResultRowProps {
  descriptionId: string | undefined;
  label: string;
  result: NotationResult;
  overflowAction: OverflowAction | undefined;
}

const statusLabels: Record<
  NotationResult['status'],
  string | undefined
> = {
  original: 'original',
  exact: 'exact',
  rounded: 'rounded',
  overflow: undefined,
};

export function ConversionResultRow({
  descriptionId,
  label,
  result,
  overflowAction,
}: ConversionResultRowProps): React.JSX.Element {
  const action = result.status === 'original' ? undefined : overflowAction;
  const precision = result.status === 'exact' && action !== undefined
    ? undefined
    : statusLabels[result.status];
  return (
    <div
      aria-describedby={descriptionId}
      aria-label={`${label} conversion`}
      className="col-span-2 grid grid-cols-subgrid items-start"
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

          {precision === undefined && action === undefined
            ? null
            : (
              <span className="text-xs text-on-background shrink-0 min-w-12">
                {precision === undefined
                  ? null
                  : <span className="block">{precision}</span>}

                {action === undefined
                  ? null
                  : <span className="block">{action}</span>}
              </span>
            )}
        </div>
      </div>

      <div>
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
