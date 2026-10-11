// Chart primitives shared by the figures: scales, ticks, axes, grid, legend,
// a self-drawing line and the reveal-on-scroll hook every plate uses.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useInView } from './motion';

const r3 = (v: number) => Math.round(1000 * v) / 1000;
const r2 = (v: number) => Math.round(100 * v) / 100;

export interface Scale {
  kind: 'linear' | 'log';
  domain: [number, number];
  range: [number, number];
  to: (v: number) => number;
  from: (px: number) => number;
}

export function scaleLinear(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return {
    kind: 'linear',
    domain,
    range,
    to: (v) => r3(r0 + ((v - d0) / span) * (r1 - r0)),
    from: (px) => d0 + ((px - r0) / (r1 - r0 || 1)) * span,
  };
}

export function scaleLog(domain: [number, number], range: [number, number]): Scale {
  const l0 = Math.log10(Math.max(domain[0], 5e-324));
  const l1 = Math.log10(Math.max(domain[1], 5e-324));
  const [r0, r1] = range;
  const span = l1 - l0 || 1;
  return {
    kind: 'log',
    domain,
    range,
    to: (v) => r3(r0 + ((Math.log10(Math.max(v, 5e-324)) - l0) / span) * (r1 - r0)),
    from: (px) => 10 ** (l0 + ((px - r0) / (r1 - r0 || 1)) * span),
  };
}

export function linearTicks([lo, hi]: [number, number], count = 5): number[] {
  const span = hi - lo;
  if (span === 0) return [lo];
  const raw = span / Math.max(count, 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  const step = (f >= 7.5 ? 10 : f >= 3.5 ? 5 : f >= 1.5 ? 2 : 1) * mag;
  const first = Math.ceil(lo / step) * step;
  const out: number[] = [];
  for (let i = 0; first + i * step <= hi + 1e-9 * step; i++) out.push(Number((first + i * step).toPrecision(12)));
  return out;
}

export function logTicks([lo, hi]: [number, number]): number[] {
  if (!(lo > 0) || !(hi > 0) || !Number.isFinite(lo) || !Number.isFinite(hi)) {
    throw new RangeError(`logTicks needs a finite, strictly positive domain, got [${lo}, ${hi}]`);
  }
  const exps: number[] = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) exps.push(e);
  const every = exps.length > 9 ? 2 : 1;
  return exps
    .filter((_, i) => i % every === 0)
    .map((e) => 10 ** e)
    .filter((v) => v >= 0.999 * lo && v <= 1.001 * hi);
}

export function logMinorTicks([lo, hi]: [number, number]): number[] {
  const out: number[] = [];
  const e0 = Math.floor(Math.log10(lo));
  const e1 = Math.ceil(Math.log10(hi));
  if (e1 - e0 > 7) return out;
  for (let e = e0; e <= e1; e++) {
    for (let m = 2; m <= 9; m++) {
      const v = m * 10 ** e;
      if (v >= lo && v <= hi) out.push(v);
    }
  }
  return out;
}

export function linePath(points: [number, number][]): string {
  if (!points.length) return '';
  let d = `M${r2(points[0][0])} ${r2(points[0][1])}`;
  for (let i = 1; i < points.length; i++) d += `L${r2(points[i][0])} ${r2(points[i][1])}`;
  return d;
}

const defaultTicks = (s: Scale) => (s.kind === 'log' ? logTicks(s.domain) : linearTicks(s.domain, 5));

export interface Frame {
  width: number;
  height: number;
  pad: { top: number; right: number; bottom: number; left: number };
  innerW: number;
  innerH: number;
}

export function makeFrame(width: number, height: number, pad: Partial<Frame['pad']> = {}): Frame {
  const p = { top: 16, right: 18, bottom: 34, left: 46, ...pad };
  return { width, height, pad: p, innerW: width - p.left - p.right, innerH: height - p.top - p.bottom };
}

/**
 * Every plate's entrance: `shown` flips true once `amount` of it is in view,
 * and `width` tracks the plate's rendered width so the drawing can lay itself
 * out for it (`fallbackWidth` until measured, including on the server).
 */
export function usePlateReveal(amount = 0.35, fallbackWidth = 460) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, amount });
  const [width, setWidth] = useState(fallbackWidth);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, shown, width };
}

export function Plot({
  frame,
  title,
  children,
  className = '',
}: {
  frame: Frame;
  /** Accessible name; the long description is the Figure's alt text. */
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${frame.width} ${frame.height}`}
      width={frame.width}
      height={frame.height}
      preserveAspectRatio="xMidYMid meet"
      className={`block h-auto w-full overflow-visible ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

export function AxisX({
  frame,
  x,
  ticks,
  format,
  label,
}: {
  frame: Frame;
  x: Scale;
  ticks?: number[];
  format: (v: number) => string;
  label?: string;
}) {
  const ts = ticks ?? defaultTicks(x);
  const y = frame.pad.top + frame.innerH;
  return (
    <g aria-hidden="true">
      <line x1={frame.pad.left} x2={frame.pad.left + frame.innerW} y1={y} y2={y} stroke="var(--color-rule-strong)" strokeWidth={1} />
      {ts.map((t) => (
        <text key={t} x={x.to(t)} y={y + 14} textAnchor="middle" className="fill-ink-faint font-mono" fontSize={9.5}>
          {format(t)}
        </text>
      ))}
      {label ? (
        <text x={frame.pad.left + frame.innerW / 2} y={frame.height - 2} textAnchor="middle" className="fill-ink-muted" fontSize={10}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function AxisY({
  frame,
  y,
  ticks,
  format,
  label,
}: {
  frame: Frame;
  y: Scale;
  ticks?: number[];
  format: (v: number) => string;
  label?: string;
}) {
  const ts = ticks ?? defaultTicks(y);
  return (
    <g aria-hidden="true">
      {ts.map((t) => (
        <text key={t} x={frame.pad.left - 7} y={y.to(t) + 3.2} textAnchor="end" className="fill-ink-faint font-mono" fontSize={9.5}>
          {format(t)}
        </text>
      ))}
      {label ? (
        <text
          transform={`translate(11 ${frame.pad.top + frame.innerH / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-ink-muted"
          fontSize={10}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function Grid({
  frame,
  x,
  y,
  xTicks,
  yTicks,
  minor = true,
}: {
  frame: Frame;
  x: Scale;
  y: Scale;
  xTicks?: number[];
  yTicks?: number[];
  minor?: boolean;
}) {
  const xs = xTicks ?? defaultTicks(x);
  const ys = yTicks ?? defaultTicks(y);
  const minors = minor && x.kind === 'log' ? logMinorTicks(x.domain) : [];
  const top = frame.pad.top;
  const bottom = frame.pad.top + frame.innerH;
  return (
    <g aria-hidden="true">
      {minors.map((t) => (
        <line key={`mx${t}`} x1={x.to(t)} x2={x.to(t)} y1={top} y2={bottom} stroke="var(--color-rule)" strokeWidth={0.5} opacity={0.45} />
      ))}
      {ys.map((t) => (
        <line key={`y${t}`} x1={frame.pad.left} x2={frame.pad.left + frame.innerW} y1={y.to(t)} y2={y.to(t)} stroke="var(--color-rule)" strokeWidth={0.75} />
      ))}
      {xs.map((t) => (
        <line key={`x${t}`} x1={x.to(t)} x2={x.to(t)} y1={top} y2={bottom} stroke="var(--color-rule)" strokeWidth={0.75} />
      ))}
    </g>
  );
}

export interface LegendItem {
  label: string;
  color: string;
  dash?: boolean;
}

export function Legend({ items, className = '' }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-1.5 ${className}`}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <svg width="16" height="8" aria-hidden="true" className="shrink-0">
            <line x1="0" y1="4" x2="16" y2="4" stroke={it.color} strokeWidth="2" strokeDasharray={it.dash ? '3 2' : undefined} />
          </svg>
          <span className="text-[11.5px] text-ink-muted">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** A line that draws itself in once `shown` (or fades in, if dashed). */
export function DrawnPath({
  d,
  stroke,
  width = 1.75,
  shown,
  delay = 0,
  duration = 1100,
  dash,
  opacity = 1,
}: {
  d: string;
  stroke: string;
  width?: number;
  shown: boolean;
  delay?: number;
  duration?: number;
  dash?: string;
  opacity?: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
  }, [d]);
  if (dash) {
    return (
      <path
        ref={ref}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        opacity={shown ? opacity : 0}
        style={{ transition: `opacity 500ms ${delay}ms var(--ease-out-quint)` }}
      />
    );
  }
  return (
    <path
      ref={ref}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      style={
        len
          ? {
              strokeDasharray: len,
              strokeDashoffset: shown ? 0 : len,
              transition: `stroke-dashoffset ${duration}ms ${delay}ms var(--ease-out-quint)`,
            }
          : { opacity: 0 }
      }
    />
  );
}

/** A labelled point on a chart that fades in after its line has drawn. */
export function Annotation({
  x,
  y,
  label,
  color = 'var(--color-accent)',
  shown,
  delay = 700,
  anchor = 'start',
  dy = -9,
  dx = 6,
  leader = false,
}: {
  x: number;
  y: number;
  label: ReactNode;
  color?: string;
  shown: boolean;
  delay?: number;
  anchor?: 'start' | 'middle' | 'end';
  dy?: number;
  dx?: number;
  leader?: boolean;
}) {
  const tx = r3(x + dx);
  const ty = r3(y + dy);
  const dist = Math.hypot(tx - x, ty - y);
  const lx = dist > 3.5 ? r3(x + ((tx - x) * (dist - 3.5)) / dist) : tx;
  const ly = dist > 3.5 ? r3(y + ((ty - y) * (dist - 3.5)) / dist) : ty;
  return (
    <g opacity={shown ? 1 : 0} style={{ transition: `opacity 420ms ${delay}ms ease-out` }}>
      {leader ? <line x1={x} y1={y} x2={lx} y2={ly} stroke={color} strokeWidth={0.75} opacity={0.55} /> : null}
      <circle cx={x} cy={y} r={6} fill={color} opacity={0.16} />
      <circle cx={x} cy={y} r={3} fill={color} />
      <text
        x={tx}
        y={ty}
        textAnchor={anchor}
        className="font-mono"
        fill={color}
        stroke="var(--color-paper-raised)"
        strokeWidth={3.5}
        strokeLinejoin="round"
        paintOrder="stroke"
        fontSize={10.5}
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}
