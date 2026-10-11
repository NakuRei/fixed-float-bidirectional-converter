interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({
  children,
  htmlFor,
  className = '',
}: LabelProps): React.JSX.Element {
  return (
    <label
      className={['text-on-background text-sm font-medium', className].join(
        ' ',
      )}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}
