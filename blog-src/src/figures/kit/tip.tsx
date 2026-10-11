// Hover/focus tooltip for charts. Position is in the plate's pixel space; the
// box flips to the other side of the pointer near the right and bottom edges.
import { useState } from 'react';

export interface TipData {
  x: number;
  y: number;
  title: string;
  rows: { label: string; value: string; color?: string }[];
}

export function useTip() {
  return useState<TipData | null>(null);
}

export function Tip({ tip, width, height }: { tip: TipData | null; width: number; height: number }) {
  if (!tip) return null;
  const flipX = tip.x > 0.62 * width;
  const flipY = tip.y > 0.7 * height;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute z-10 min-w-[8.5rem] border border-rule-strong bg-paper-raised px-2.5 py-2 shadow-[0_2px_10px_rgba(20,20,22,0.09)]"
      style={{
        left: tip.x,
        top: tip.y,
        transform: `translate(${flipX ? 'calc(-100% - 12px)' : '12px'}, ${flipY ? 'calc(-100% - 12px)' : '12px'})`,
      }}
    >
      <p className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">{tip.title}</p>
      <ul className="mt-1.5 space-y-1">
        {tip.rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2 text-[11.5px]">
            {r.color ? <span aria-hidden="true" className="size-2 shrink-0 rounded-[1px]" style={{ background: r.color }} /> : null}
            <span className="text-ink-muted">{r.label}</span>
            <span className="ml-auto font-mono font-semibold text-ink tabular">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
