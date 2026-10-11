interface ConversionErrorMessageProps {
  id: string;
  message: string;
}

export function ConversionErrorMessage(
  { id, message }: ConversionErrorMessageProps,
): React.JSX.Element {
  return (
    <div
      className={[
        'w-full h-fit',
        'flex flex-col justify-start items-center',
        'px-4 py-2',
        'bg-error-container',
        'text-error',
      ].join(' ')}
      id={id}
    >
      <p className="text-sm">ERROR:</p>
      <p className="text-base">{message}</p>
    </div>
  );
}
