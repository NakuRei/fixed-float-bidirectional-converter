import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon, WarningIcon } from '@phosphor-icons/react';

import { IconButton } from './IconButton';

interface CopyButtonProps {
  label: string;
  value: string;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

const statusResetDelayMs = 2000;

const statusIcons = {
  idle: CopyIcon,
  copied: CheckIcon,
  failed: WarningIcon,
} as const;

export function CopyButton({
  label,
  value,
}: CopyButtonProps): React.JSX.Element {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') {
      return undefined;
    }
    const timeoutId = setTimeout(() => {
      setStatus('idle');
    }, statusResetDelayMs);
    return (): void => {
      clearTimeout(timeoutId);
    };
  }, [status]);

  async function copyValue(): Promise<void> {
    /*
     * Resetting first makes a repeated copy a fresh status change, so the
     * reset timer and the screen reader announcement both start again.
     */
    setStatus('idle');
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      /*
       * The Clipboard API is missing outside secure contexts and rejects
       * when the browser denies clipboard access.
       */
      setStatus('failed');
    }
  }

  const StatusIcon = statusIcons[status];
  const statusMessages = {
    idle: '',
    copied: `${label} value copied`,
    failed: `Could not copy ${label} value`,
  };

  return (
    <>
      <IconButton
        ariaLabel={`Copy ${label} value`}
        icon={(
          <StatusIcon
            size={20}
            weight="bold"
          />
        )}
        onClick={() => {
          void copyValue();
        }}
        size="sm"
        title={`Copy ${label} value`}
        variant="outline-primary-accent"
      />

      <span
        aria-live="polite"
        className="sr-only"
      >
        {statusMessages[status]}
      </span>
    </>
  );
}
