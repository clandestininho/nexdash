import React from 'react';
import { cn } from '../../lib/utils';

export function ShinyButton({ 
  children, 
  onClick, 
  className = "", 
  type = "button", 
  disabled = false 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn("shiny-cta disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]", className)}
    >
      <span>{children}</span>
    </button>
  );
}
