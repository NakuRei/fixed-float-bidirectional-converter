interface InputWithLabelContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function InputWithLabelContainer({
  children,
  className = '',
}: InputWithLabelContainerProps): React.JSX.Element {
  return (
    <div
      className={[
        'w-full h-fit',
        'flex flex-col',
        'items-start justify-center',
        'gap-2',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
