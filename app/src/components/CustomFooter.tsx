export function CustomFooter(): React.JSX.Element {
  return (
    <footer
      className={[
        'w-full h-full',
        'px-12 py-2',
        'border-t border-outline',
        'bg-background',
        'text-on-background',
        'transition duration-500 ease-in-out',
        'flex flex-row gap-4 items-center justify-between',
      ].join(' ')}
    >
      <span className="text-sm">© 2024 NakuRei</span>
    </footer>
  );
}
