import { type VariantProps } from 'class-variance-authority';

import { iconButtonVariants } from './iconButtonVariants';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  ariaLabel: string;
  className?: string;
}

export function IconButton({
  icon,
  ariaLabel,
  variant,
  size,
  disabled = false,
  className = '',
  ...props
}: IconButtonProps): React.JSX.Element {
  return (
    <button
      aria-label={ariaLabel}
      className={iconButtonVariants({ variant,
        size,
        className })}
      disabled={disabled}
      type="button"
      {...props}
    >
      {icon}
    </button>
  );
}
