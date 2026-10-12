import { GithubLogoIcon } from '@phosphor-icons/react';

import { iconButtonVariants } from './iconButtonVariants';

const repositoryLinkLabel = 'GitHub repository (opens in new tab)';

export function AppHeader(): React.JSX.Element {
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
      <h1 className="flex flex-row gap-2 items-center font-bold">
        <img
          alt=""
          className="size-6"
          src={`${import.meta.env.BASE_URL}favicon.svg`}
        />

        <span>Fixed-Float Bidirectional Converter</span>
      </h1>

      <div>
        <a
          aria-label={repositoryLinkLabel}
          className={iconButtonVariants({
            variant: 'outline-primary-accent',
            size: 'md',
          })}
          href="https://github.com/NakuRei/fixed-float-bidirectional-converter"
          rel="noopener noreferrer"
          target="_blank"
          title={repositoryLinkLabel}
        >
          <GithubLogoIcon
            aria-hidden
            size={20}
            weight="bold"
          />
        </a>
      </div>
    </header>
  );
}
