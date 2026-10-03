interface CustomInputProps extends React.ComponentPropsWithoutRef<'input'> {
  id: string;
  type: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CustomInput({
  className = '',
  ...inputProps
}: CustomInputProps): React.JSX.Element {
  return (
    <input
      {...inputProps}
      className={[
        'w-full h-fit',
        'px-4 py-2',
        'rounded-md',
        'border-2',
        'border-primary-700',
        'bg-primary-container/20',
        'text-on-background',
        'focus:border-on-primary-container focus:outline-hidden',
        'focus:shadow-lg focus:shadow-on-primary-container/20',
        'focus:bg-background-950',
        'focus:ring-2 focus:ring-primary-700/20',
        'aria-invalid:border-error',
        'placeholder-background-500',
        'focus:placeholder-transparent',
        'transition duration-300 focus:duration-0 ease-in-out',
        className,
      ].join(' ')}
    />
  );
}
