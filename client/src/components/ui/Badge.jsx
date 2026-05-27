import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium font-body transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#C9A84C] text-[#1A1611]',
        secondary:
          'border-transparent bg-[#EDE8DC] text-[#1A1611]/80',
        outline:
          'border-[#C9A84C]/40 text-[#1A1611]/80 bg-transparent',
        destructive:
          'border-transparent bg-[#B05C3A] text-white',
        success:
          'border-transparent bg-[#4CAF50]/15 text-[#2E7D32]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Badge = React.forwardRef(
  ({ className, variant, backgroundColor, textColor, style, ...props }, ref) => {
    const customStyle =
      backgroundColor || textColor
        ? {
            backgroundColor: backgroundColor || undefined,
            color: textColor || undefined,
            borderColor: backgroundColor
              ? `${backgroundColor}33`
              : undefined,
            ...style,
          }
        : style;

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant: backgroundColor ? null : variant }), className)}
        style={customStyle}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
