import { cva, VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-full',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-offset-2',
    'transition duration-150 ease-in-out',
    'active:scale-95',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-500',
          'text-background',
          'hover:bg-primary-600',
          'focus-visible:ring-primary-500',
          'focus-visible:ring-offset-background',
        ].join(' '),
        'outline-primary': [
          'bg-transparent',
          'text-primary-400',
          'border border-offset-2 border-primary-400',
          'hover:bg-primary-500',
          'hover:text-background',
          'hover:border-primary-500',
          'focus-visible:ring-primary-400',
          'focus-visible:ring-offset-background',
        ].join(' '),
        'outline-primary-accent': [
          'bg-transparent',
          'text-primary-400',
          'border border-offset-2 border-primary-400',
          'hover:bg-on-primary-container',
          'hover:text-background',
          'hover:border-on-primary-container',
          'focus-visible:ring-on-primary-container',
          'focus-visible:ring-offset-background',
        ].join(' '),
      },
      size: {
        sm: 'p-1',
        md: 'p-2',
        lg: 'p-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
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
}: IconButtonProps): JSX.Element {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
}
