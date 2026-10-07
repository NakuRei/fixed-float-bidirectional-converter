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

        /*
         * The open option list is drawn with the OS highlight colour unless
         * the browser supports customizable select; others keep the native UI.
         */
        'base-select:[appearance:base-select]',
        'base-select:[&::picker(select)]:[appearance:base-select]',
        'base-select:[&::picker(select)]:mt-1',
        'base-select:[&::picker(select)]:rounded-md',
        'base-select:[&::picker(select)]:border-2',
        'base-select:[&::picker(select)]:border-primary-700',
        'base-select:[&::picker(select)]:bg-background-950',
        'base-select:[&::picker(select)]:text-on-background',
        'base-select:[&_option]:px-4 base-select:[&_option]:py-2',
        'base-select:[&_option:checked]:bg-primary-container',
        'base-select:[&_option:checked]:text-on-primary-container',
        'base-select:[&_option:hover]:bg-primary-700',
        'base-select:[&_option:hover]:text-on-primary-container',
        // :focus would also mark the selected option a mouse user isn't on.
        'base-select:[&_option:focus-visible]:bg-primary-700',
        'base-select:[&_option:focus-visible]:text-on-primary-container',
        'base-select:[&_option:focus-visible]:outline-hidden',
        className,
      ].join(' ')}
    />
  );
}
