import { useId } from 'react';

import { Label } from './Label';

interface ToggleProps {
  checked: boolean;
  children?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function Toggle({
  checked,
  children,
  onChange,
  className = '',
}: ToggleProps): React.JSX.Element {
  const inputId = useId();

  return (
    <Label
      className={[
        'w-full h-fit',
        'flex flex-row',
        'items-center justify-start',
        'gap-4',
        'cursor-pointer',
        className,
      ].join(' ')}
      htmlFor={inputId}
    >
      <input
        checked={checked}
        className="sr-only peer"
        id={inputId}
        onChange={onChange}
        type="checkbox"
        value=""
      />

      <div
        className={[
          'relative',
          'w-11 h-6 rounded-full',
          'bg-background-700',
          'peer-focus:outline-hidden',
          'peer-focus:ring-2 peer-focus:ring-on-primary-container',
          'peer-checked:bg-primary-800',
          'peer-checked:after:translate-x-full',
          'peer-checked:rtl:after:-translate-x-full',
          'peer-checked:after:border-on-background',
          'peer',
          'after:absolute',
          'after:top-[2px] after:inset-s-[2px]',
          'after:content-[""]',
          'after:w-5 after:h-5 after:rounded-full',
          'after:bg-on-background',
          'after:border after:border-on-background',
          'after:transition-all',
        ].join(' ')}
      />

      {children}
    </Label>
  );
}
