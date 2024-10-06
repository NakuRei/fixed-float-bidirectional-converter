interface CustomLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function CustomLabel({
  children,
  htmlFor,
  className = '',
}: CustomLabelProps): React.JSX.Element {
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
