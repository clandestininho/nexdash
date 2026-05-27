import React from 'react';
import { cn } from '../lib/utils';

/**
 * ClassificationBadge — small confidence pill
 * Green >= 0.9, Gold >= 0.85, Orange >= 0.7, Red < 0.7
 */
export default function ClassificationBadge({ confidence, className }) {
  if (confidence == null || confidence === undefined) return null;

  const pct = Math.round(confidence * 100);

  let badgeStyle;

  if (confidence >= 0.9) {
    badgeStyle = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
  } else if (confidence >= 0.85) {
    badgeStyle = 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
  } else if (confidence >= 0.7) {
    badgeStyle = 'bg-orange-500/10 border border-orange-500/20 text-orange-400';
  } else {
    badgeStyle = 'bg-rose-500/10 border border-rose-500/20 text-rose-400';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold font-body tabular-nums shadow-sm',
        badgeStyle,
        className
      )}
    >
      {pct}%
    </span>
  );
}
