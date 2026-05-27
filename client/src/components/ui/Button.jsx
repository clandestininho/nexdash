import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium font-body transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff483d] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#ff483d] text-white hover:bg-[#e03d32] shadow-sm hover:shadow-lg shadow-[#ff483d]/15 hover:shadow-[#ff483d]/25 transition-all duration-200',
        outline:
          'border border-zinc-800 bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700',
        ghost:
          'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60',
        destructive:
          'bg-[#B05C3A] text-white hover:bg-[#9a4f32] shadow-sm hover:shadow-md',
        secondary:
          'bg-zinc-900 text-zinc-100 hover:bg-zinc-850 border border-zinc-800/80',
        link:
          'text-[#ff483d] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
        default: 'h-10 px-5 py-2 gap-2',
        lg: 'h-12 px-8 text-base gap-2.5 rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
