export function CustomHeader(): JSX.Element {
  return (
    <header
      className={[
        'w-full h-full',
        'px-12 py-2',
        'border-b border-outline',
        'bg-background',
        'text-on-background',
        'transition duration-500 ease-in-out',
        'flex flex-row gap-4 items-center justify-between',
      ].join(' ')}
    >
      Binary Conversion Tool
    </header>
  );
}
