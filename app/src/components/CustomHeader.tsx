import { GithubLogo } from '@phosphor-icons/react';

import { IconButton } from './IconButton';

export function CustomHeader(): JSX.Element {
  function openLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

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
      <div>Fixed-Float Bidirectional Converter</div>
      <div>
        <IconButton
          icon={<GithubLogo size={20} weight="bold" />}
          ariaLabel="Take a photo"
          variant="outline-primary-accent"
          size="md"
          onClick={() => {
            openLink(
              'https://github.com/NakuRei/fixed-float-bidirectional-converter',
            );
          }}
          title="Open GitHub repository"
        />
      </div>
    </header>
  );
}
