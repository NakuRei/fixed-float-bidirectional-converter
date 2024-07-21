interface CustomInputProps {
  id: string;
  type: string;
  inputMode?:
    | 'search'
    | 'email'
    | 'tel'
    | 'text'
    | 'url'
    | 'none'
    | 'numeric'
    | 'decimal'
    | undefined;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export function CustomInput({
  id,
  type = 'text',
  inputMode = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
}: CustomInputProps): JSX.Element {
  return (
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={[
        'w-full h-fit',
        'px-4 py-2',
        'rounded-md',
        'border-2',
        'border-primary-700',
        'bg-primary-container bg-opacity-20',
        'text-on-background',
        'focus:border-on-primary-container focus:outline-none',
        'focus:shadow-lg focus:shadow-on-primary-container/20',
        'focus:bg-background-950',
        'focus:ring-2 focus:ring-primary-700 focus:ring-opacity-20',
        'placeholder-background-500',
        'focus:placeholder-transparent',
        'transition duration-300 focus:duration-0 ease-in-out',
        className,
      ].join(' ')}
    />
  );
}
