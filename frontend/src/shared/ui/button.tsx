import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
const variants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm text-xs focus-visible:outline-2 disabled:opacity-35',
  {
    variants: {
      variant: { default: 'bg-[var(--surface-3)]', ghost: 'bg-transparent' },
      size: { default: 'px-3 py-1.5', icon: 'size-8' },
    },
    defaultVariants: { variant: 'ghost', size: 'default' },
  },
);
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(variants({ variant, size }), className)} {...props} />;
}
