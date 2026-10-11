// Updatable surface area by index design: a tree can modify any node in place,
// an LSM only its memtable, which is what fits in the SCR.
import { useState } from 'react';
import { track } from '@/lib/analytics';
import { SURFACE_AREA_MODES } from '@/content/posts/one-memory-many-machines/data';

const ACCENT = 'var(--color-accent)';
const AMBER = 'var(--color-s5)';
const RUST = 'var(--color-s6)';
/** Height of the index triangle, apex at y = 24, base at y = 232. */
const H = 208;
/** Half-width of the triangle at height y. */
const halfWidth = (y: number) => (128 * (y - 24)) / H;

/** The slice of the triangle between fractions `from` and `to` of its height. */
function band(from: number, to: number) {
  const y0 = 24 + from * H;
  const y1 = 24 + to * H;
  const w0 = halfWidth(y0);
  const w1 = halfWidth(y1);
  return `${168 - w0},${y0} ${168 + w0},${y0} ${168 + w1},${y1} ${168 - w1},${y1}`;
}

/** Bottom of the memtable band (and of the SCR box). */
const MEMTABLE_Y = 24 + 0.28 * H;

/** Greedy word wrap at 70 characters. */
function wrap(text: string) {
  const lines = [''];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length > 70) lines.push(word);
    else lines[lines.length - 1] = last ? `${last} ${word}` : word;
  }
  return lines;
}

export default function SurfaceArea() {
  const [active, setActive] = useState(1);
  const mode = SURFACE_AREA_MODES[active];
  const isTree = mode.key === 'tree';
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: 'opacity 320ms ease-out' });

  const spanBottom = 24 + mode.mutableTo * H;
  const spanX = 314;
  const spanColor = isTree ? RUST : ACCENT;

  return (
    <div>
      <div role="tablist" aria-label="Index design" className="flex flex-wrap gap-2">
        {SURFACE_AREA_MODES.map((m, i) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={active === i}
            onClick={() => {
              setActive(i);
              track('surface_area_toggle', { index: m.key });
            }}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors duration-150 ${active === i ? 'border-accent bg-accent text-paper-raised' : 'border-rule-strong text-ink-muted hover:border-ink hover:text-ink'}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 520 300"
        className="mt-4 block h-auto w-full overflow-visible"
        role="img"
        aria-label={`${mode.label}: the updatable surface area is ${mode.verdict}`}
      >
        <title>{`${mode.label}: updatable surface area, ${mode.verdict}`}</title>
        <polygon
          points={`168,24 ${296},232 ${40},232`}
          fill="var(--color-paper-sunk)"
          stroke="var(--color-ink)"
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
        <g style={fade(isTree)}>
          <polygon points={band(0, 1)} fill={RUST} opacity={0.72} />
          <text
            x={168}
            y={24 + 0.8 * H}
            textAnchor="middle"
            className="font-mono"
            fill="var(--color-paper-raised)"
            fontSize={9.5}
            fontWeight={700}
          >
            any node can be modified in place
          </text>
          <text x={168} y={24 + 0.8 * H + 14} textAnchor="middle" className="font-mono" fill="var(--color-paper-raised)" fontSize={8.5}>
            every node needs a version number
          </text>
        </g>
        <g style={fade(!isTree)}>
          <polygon points={band(0, 0.28)} fill={ACCENT} opacity={0.9} />
          <line x1={154} y1={24 + 0.17 * H} x2={104} y2={24 + 0.17 * H} stroke={ACCENT} strokeWidth={1} strokeDasharray="3 3" />
          <text
            x={100}
            y={24 + 0.17 * H + 3.5}
            textAnchor="end"
            className="font-mono"
            fill="var(--color-accent-deep)"
            fontSize={9.5}
            fontWeight={700}
          >
            memtable
          </text>
          <text x={100} y={24 + 0.17 * H + 15} textAnchor="end" className="font-mono" fill="var(--color-ink-muted)" fontSize={8}>
            all in-place updates
          </text>
        </g>
        <g style={fade(!isTree)}>
          <text x={168} y={24 + 0.7 * H} textAnchor="middle" className="font-mono" fill="var(--color-ink)" fontSize={9.5} fontWeight={700}>
            SSTables · immutable
          </text>
          <text x={168} y={24 + 0.7 * H + 13} textAnchor="middle" className="font-mono" fill="var(--color-ink-muted)" fontSize={8.5}>
            no coherence tracking while alive
          </text>
        </g>
        <text x={168} y={250} textAnchor="middle" className="fill-ink font-mono" fontSize={10.5} fontWeight={700} letterSpacing={2}>
          INDEX
        </text>
        <g style={{ transition: 'opacity 320ms' }}>
          <line
            x1={spanX}
            y1={24}
            x2={spanX}
            y2={spanBottom}
            stroke={spanColor}
            strokeWidth={1.5}
            style={{ transition: 'y2 320ms ease-out, stroke 320ms' }}
          />
          <line x1={spanX - 5} y1={24} x2={spanX + 5} y2={24} stroke={spanColor} strokeWidth={1.5} />
          <line
            x1={spanX - 5}
            y1={spanBottom}
            x2={spanX + 5}
            y2={spanBottom}
            stroke={spanColor}
            strokeWidth={1.5}
            style={{ transition: 'y1 320ms ease-out, y2 320ms ease-out, stroke 320ms' }}
          />
          <text
            transform={`translate(${spanX + 11} ${(24 + spanBottom) / 2}) rotate(90)`}
            textAnchor="middle"
            className="font-mono"
            fill={spanColor}
            fontSize={8.5}
            fontWeight={700}
            style={{ transition: 'fill 320ms' }}
          >
            updatable surface area
          </text>
        </g>
        <rect x={372} y={24} width={132} height={MEMTABLE_Y - 24} rx={4} fill="var(--color-accent-soft)" stroke={ACCENT} strokeWidth={1.25} />
        <text x={381} y={39} className="fill-accent-deep font-mono" fontSize={8.5} fontWeight={700}>
          SCR
        </text>
        <text x={381} y={51} className="fill-ink-faint font-mono" fontSize={7.5}>
          hardware coherent
        </text>
        <text
          x={381}
          y={MEMTABLE_Y - 9}
          className="font-mono"
          fill={isTree ? RUST : 'var(--color-accent-deep)'}
          fontSize={8}
          fontWeight={700}
          style={{ transition: 'fill 320ms' }}
        >
          {isTree ? 'versions overflow' : 'memtable'}
        </text>
        <rect
          x={372}
          y={MEMTABLE_Y + 8}
          width={132}
          height={232 - MEMTABLE_Y - 8}
          rx={4}
          fill={AMBER}
          opacity={0.14}
          stroke={AMBER}
          strokeWidth={1}
        />
        <text x={381} y={MEMTABLE_Y + 23} className="fill-ink-muted font-mono" fontSize={8.5} fontWeight={700}>
          LNR
        </text>
        <text x={381} y={MEMTABLE_Y + 35} className="fill-ink-faint font-mono" fontSize={7.5}>
          no coherence across hosts
        </text>
        <text
          x={381}
          y={223}
          className="font-mono"
          fill={isTree ? RUST : 'var(--color-ink-muted)'}
          fontSize={8}
          fontWeight={700}
          style={{ transition: 'fill 320ms' }}
        >
          {isTree ? 'spilled versions + nodes' : 'SSTables'}
        </text>
        <g style={fade(!isTree)}>
          <line
            x1={168 + halfWidth(24) + 2}
            y1={24}
            x2={372}
            y2={24}
            stroke={ACCENT}
            strokeWidth={0.75}
            strokeDasharray="3 3"
            opacity={0.6}
          />
          <line
            x1={168 + halfWidth(MEMTABLE_Y) + 2}
            y1={MEMTABLE_Y}
            x2={372}
            y2={MEMTABLE_Y}
            stroke={ACCENT}
            strokeWidth={0.75}
            strokeDasharray="3 3"
            opacity={0.6}
          />
        </g>
        <text x={260} y={272} textAnchor="middle" className="fill-ink-muted font-serif" fontSize={12} fontStyle="italic">
          {wrap(mode.caption).map((line, i) => (
            <tspan key={i} x={260} dy={i ? 15 : 0}>
              {line}
            </tspan>
          ))}
        </text>
      </svg>
    </div>
  );
}
