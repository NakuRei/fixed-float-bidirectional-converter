interface CustomSelectProps extends React.ComponentPropsWithoutRef<'select'> {
  id: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function CustomSelect({
  className = '',
  ...selectProps
}: CustomSelectProps): React.JSX.Element {
  return (
    <select
      {...selectProps}
      className={[
        'w-full h-fit',
        'px-4 py-2',
        'rounded-md',
        'border-2 border-primary-700',
        'bg-primary-container/20 text-on-background',
        'scheme-dark cursor-pointer',
        'focus:border-on-primary-container focus:outline-hidden',
        'focus:shadow-lg focus:shadow-on-primary-container/20',
        'focus:bg-background-950',
        'focus:ring-2 focus:ring-primary-700/20',
        'transition duration-300 focus:duration-0 ease-in-out',
        className,
      ].join(' ')}
    />
  );
}
