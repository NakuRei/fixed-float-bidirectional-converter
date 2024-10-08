import { CustomLabel } from './CustomLabel';

interface CustomToggleProps {
  id: string;
  checked: boolean;
  children?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export function CustomToggle({
  id,
  checked,
  children,
  onChange,
  onKeyUp,
  className = '',
}: CustomToggleProps): React.JSX.Element {
  return (
    <CustomLabel
      className={[
        'w-full h-fit',
        'flex flex-row',
        'items-center justify-start',
        'gap-4',
        'cursor-pointer',
        className,
      ].join(' ')}
      htmlFor={id}
    >
      <input
        checked={checked}
        className="sr-only peer"
        id={id}
        onChange={onChange}
        onKeyUp={onKeyUp}
        type="checkbox"
        value=""
      />

      <div
        className={[
          'relative',
          'w-11 h-6 rounded-full',
          'bg-background-700',
          'peer-focus:outline-none',
          'peer-focus:ring-2 peer-focus:ring-on-primary-container',
          'peer-checked:bg-primary-800',
          'peer-checked:after:translate-x-full',
          'rtl:peer-checked:after:-translate-x-full',
          'peer-checked:after:border-on-background',
          'peer',
          'after:absolute',
          'after:top-[2px] after:start-[2px]',
          'after:content-[""]',
          'after:w-5 after:h-5 after:rounded-full',
          'after:bg-on-background',
          'after:border after:border-on-background',
          'after:transition-all',
        ].join(' ')}
      />

      {children}
    </CustomLabel>
  );
}
