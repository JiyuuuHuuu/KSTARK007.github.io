// The CXL shared log: ordered entries in the LNR, head and tail in the SCR, hosts appending and replaying into replicas.
import { usePlateReveal } from '../kit/plot';
import { SHARED_LOG_NOTE } from '@/content/posts/one-memory-many-machines/data';

const halo = {
  stroke: 'var(--color-paper-raised)',
  strokeWidth: 3,
  strokeLinejoin: 'round' as const,
  paintOrder: 'stroke',
};

export default function SharedLog() {
  const { ref, shown } = usePlateReveal(0.3);

  return (
    <div ref={ref}>
      <svg viewBox="0 0 520 202" className="block h-auto w-full overflow-visible" role="img" aria-label="A shared log in CXL memory">
        <title>The CXL shared log</title>
        <defs>
          <marker id="log-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-accent)" />
          </marker>
          <marker id="log-arrow-teal" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-s4)" />
          </marker>
        </defs>
        {[0, 1].map((i) => {
          const x = i === 0 ? 60 : 340;
          return (
            <g key={i} opacity={shown ? 1 : 0} style={{ transition: `opacity 450ms ${120 * i}ms ease-out` }}>
              <rect x={x} y={14} width={120} height={64} rx={4} fill="var(--color-paper-raised)" stroke="var(--color-rule-strong)" strokeWidth={1.25} />
              <text x={x + 60} y={32} textAnchor="middle" className="fill-ink font-mono" fontSize={10} fontWeight={700}>
                Host {i + 1}
              </text>
              <rect x={x + 10} y={40} width={100} height={28} rx={3} fill="var(--color-s4)" opacity={0.16} stroke="var(--color-s4)" />
              <text x={x + 60} y={58} textAnchor="middle" className="font-mono" fill="var(--color-s4)" fontSize={9.5} fontWeight={700}>
                INDEX REPLICA
              </text>
            </g>
          );
        })}
        <g transform="translate(0 24)">
          <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 500ms 600ms ease-out' }}>
            <path d="M 120 54 C 130 84, 220 74, 292 96" stroke="var(--color-accent)" strokeWidth={1.5} fill="none" markerEnd="url(#log-arrow)" />
            <text x={158} y={64} className="fill-accent-deep font-mono" fontSize={9} fontWeight={600} {...halo}>
              append · compare-and-swap on the tail
            </text>
          </g>
          <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 420ms 560ms ease-out' }}>
            <path d="M 230 110 C 300 76, 350 76, 396 56" stroke="var(--color-s4)" strokeWidth={1.5} fill="none" markerEnd="url(#log-arrow-teal)" />
            <text x={404} y={78} className="font-mono" fill="var(--color-s4)" fontSize={9} fontWeight={600} {...halo}>
              replay → replica
            </text>
          </g>
          <g>
            <rect x={30} y={96} width={380} height={54} rx={4} fill="var(--color-s5)" opacity={0.12} stroke="var(--color-s5)" />
            <text x={38} y={105} className="font-mono" fill="var(--color-s5)" fontSize={7.5}>
              LNR
            </text>
            {Array.from({ length: 9 }, (_, i) => {
              const written = i < 6;
              const appending = i === 6;
              return (
                <g key={i}>
                  <rect
                    x={48 + 38 * i}
                    y={108}
                    width={32}
                    height={30}
                    rx={2.5}
                    fill={written ? 'var(--color-s2)' : appending ? 'var(--color-accent)' : 'var(--color-paper-raised)'}
                    opacity={appending ? (shown ? 0.9 : 0) : written ? 0.55 : 1}
                    stroke={written || appending ? 'none' : 'var(--color-rule-strong)'}
                    strokeDasharray={written || appending ? undefined : '3 2'}
                    style={appending ? { transition: 'opacity 360ms 620ms ease-out' } : undefined}
                  />
                  {written || appending ? (
                    <text
                      x={64 + 38 * i}
                      y={127}
                      textAnchor="middle"
                      className="fill-paper-raised font-mono"
                      fontSize={8.5}
                      fontWeight={600}
                      fill="var(--color-paper-raised)"
                    >
                      {i + 1}
                    </text>
                  ) : null}
                </g>
              );
            })}
            <text x={220} y={166} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={9}>
              shared log · ordered · entries flushed on write, read past the cache
            </text>
          </g>
          <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 500ms 400ms ease-out' }}>
            <rect x={428} y={102} width={72} height={42} rx={4} fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth={1.25} />
            <text x={464} y={117} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={8.5} fontWeight={700}>
              SCR
            </text>
            <text x={464} y={128} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={8.5}>
              head = 1
            </text>
            <text x={464} y={139} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={8.5}>
              tail = 7
            </text>
            <line x1={428} y1={123} x2={296} y2={123} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          </g>
        </g>
      </svg>
      <p className="mt-3 font-serif text-[12.5px] leading-relaxed text-ink-muted italic">{SHARED_LOG_NOTE}</p>
    </div>
  );
}
