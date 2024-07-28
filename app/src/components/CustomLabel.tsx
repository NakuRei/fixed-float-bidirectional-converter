interface CustomLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function CustomLabel({
  children,
  htmlFor,
  className = '',
}: CustomLabelProps): JSX.Element {
  return (
    <label
      htmlFor={htmlFor}
      className={['text-on-background text-sm font-medium', className].join(
        ' ',
      )}
    >
      {children}
    </label>
  );
}
