// CXL generations as tabs: one host with expansion memory, a switch carving a pool into slices, and true multi-host sharing.
import { useState } from 'react';
import { CXL_VERSIONS } from '@/content/posts/one-memory-many-machines/data';
import { track } from '@/lib/analytics';

const HOST_COLORS = ['var(--color-s3)', 'var(--color-s4)', 'var(--color-s5)', 'var(--color-s6)'];

/** Greedy word wrap at 66 characters per line. */
function wrap(text: string): string[] {
  const lines = [''];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length > 66) lines.push(word);
    else lines[lines.length - 1] = last ? `${last} ${word}` : word;
  }
  return lines;
}

export default function CxlVersions() {
  const [active, setActive] = useState(2);
  const v = CXL_VERSIONS[active];
  const hostCount = active === 0 ? 1 : 4;
  const hostXs = active === 0 ? [225] : [45, 165, 285, 405];

  return (
    <div>
      <div role="tablist" aria-label="CXL generation" className="flex flex-wrap gap-2">
        {CXL_VERSIONS.map((g, i) => (
          <button
            key={g.version}
            role="tab"
            aria-selected={active === i}
            onClick={() => {
              setActive(i);
              track('cxl_generation_toggle', { generation: g.version });
            }}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors duration-150 ${active === i ? 'border-accent bg-accent text-paper-raised' : 'border-rule-strong text-ink-muted hover:border-ink hover:text-ink'}`}
          >
            {g.version}
            {' · '}
            {g.year}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 520 262" className="mt-4 block h-auto w-full overflow-visible" role="img" aria-label={`${v.version}: ${v.headline}`}>
        <title>{`${v.version}: ${v.headline}`}</title>
        {hostXs.map((x, i) => (
          <g key={i} style={{ transition: 'opacity 300ms ease-out' }}>
            <rect x={x} y={16} width={70} height={38} rx={4} fill="var(--color-paper-raised)" stroke={HOST_COLORS[i]} strokeWidth={1.5} />
            <text x={x + 35} y={39} textAnchor="middle" className="fill-ink font-mono" fontSize={10} fontWeight={600}>
              {hostCount === 1 ? 'Host' : `Host ${i + 1}`}
            </text>
            <line
              x1={x + 35}
              y1={54}
              x2={active === 1 ? 260 : x + 35}
              y2={active === 1 ? 100 : 150}
              stroke={HOST_COLORS[i]}
              strokeWidth={1.25}
              opacity={0.7}
            />
          </g>
        ))}
        {active === 1 ? (
          <g>
            <rect x={225} y={100} width={70} height={22} rx={3} fill="var(--color-paper-sunk)" stroke="var(--color-ink)" strokeWidth={1} />
            <text x={260} y={115} textAnchor="middle" className="fill-ink font-mono" fontSize={9} fontWeight={600}>
              CXL SWITCH
            </text>
            {hostXs.map((_, i) => (
              <line key={i} x1={260} y1={122} x2={90 + 113 * i} y2={150} stroke={HOST_COLORS[i]} strokeWidth={1.25} opacity={0.7} />
            ))}
          </g>
        ) : null}
        <rect x={35} y={150} width={450} height={64} rx={5} fill="var(--color-paper-raised)" stroke="var(--color-ink)" strokeWidth={1.25} />
        {active === 0 ? (
          <g>
            <rect x={41} y={156} width={438} height={52} rx={3} fill={HOST_COLORS[0]} opacity={0.2} />
            <text x={260} y={186} textAnchor="middle" className="fill-ink font-mono" fontSize={10.5} fontWeight={600}>
              all of it, one host’s address space
            </text>
          </g>
        ) : null}
        {active === 1
          ? hostXs.map((_, i) => (
              <g key={i}>
                <rect
                  x={43 + 110 * i}
                  y={156}
                  width={104}
                  height={52}
                  rx={3}
                  fill={HOST_COLORS[i]}
                  opacity={0.22}
                  stroke={HOST_COLORS[i]}
                  strokeWidth={1}
                />
                <text x={95 + 110 * i} y={186} textAnchor="middle" className="fill-ink font-mono" fontSize={9.5} fontWeight={600}>
                  Host {i + 1}’s
                </text>
              </g>
            ))
          : null}
        {active === 2 ? (
          <g>
            <rect x={41} y={156} width={438} height={52} rx={3} fill={HOST_COLORS[1]} opacity={0.2} />
            <text x={260} y={186} textAnchor="middle" className="fill-ink font-mono" fontSize={10.5} fontWeight={700}>
              the same bytes, in multiple address spaces at once
            </text>
          </g>
        ) : null}
        <text x={260} y={236} textAnchor="middle" className="fill-ink-muted font-serif" fontSize={12} fontStyle="italic">
          {wrap(`${v.headline}: ${v.what}`).map((line, i) => (
            <tspan key={i} x={260} dy={i ? 16 : 0}>
              {line}
            </tspan>
          ))}
        </text>
      </svg>
    </div>
  );
}
