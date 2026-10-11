// Latency ladder: a log-scale dot plot of access latency per memory tier, from L1 cache to NVMe, with CXL highlighted.
import { scaleLog, usePlateReveal } from '../kit/plot';
import { LATENCY_LADDER } from '@/content/posts/one-memory-many-machines/data';

const TICKS = [1, 10, 100, 1e3, 1e4, 1e5];

export default function LatencyLadder() {
  const { ref, shown, width } = usePlateReveal(0.3, 520);
  const w = Math.max(320, width);
  const narrow = w < 470;
  const left = narrow ? 82 : Math.min(96, 0.24 * w);
  const h = 34 * LATENCY_LADDER.length + 30;
  const x = scaleLog([0.7, 12e4], [left, w - 18]);

  return (
    <div ref={ref}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="Approximate access latency by memory tier, log scale"
      >
        <title>Approximate access latency by tier</title>
        {TICKS.map((t) => (
          <g key={t} aria-hidden="true">
            <line x1={x.to(t)} x2={x.to(t)} y1={2} y2={h - 24} stroke="var(--color-rule)" strokeWidth={0.75} />
            <text x={x.to(t)} y={h - 9} textAnchor="middle" className="fill-ink-faint font-mono" fontSize={9}>
              {t < 1e3 ? `${t} ns` : `${t / 1e3} µs`}
            </text>
          </g>
        ))}
        {LATENCY_LADDER.map((row, i) => {
          const top = 10 + 34 * i;
          const cx = x.to(row.ns);
          const color = row.accent ? 'var(--color-accent)' : 'var(--color-s2)';
          // Flip the label to the left of the dot when it would run off the right edge.
          const flip = cx + 12 + 5.9 * (narrow ? row.label : `${row.label}  ${row.note}`).length > w - 18;
          return (
            <g key={row.tier}>
              <text
                x={left - 10}
                y={top + 15}
                textAnchor="end"
                className={`font-mono ${row.accent ? 'fill-accent-deep' : 'fill-ink-muted'}`}
                fontSize={10}
                fontWeight={row.accent ? 700 : 500}
              >
                {row.tier}
              </text>
              <line
                x1={left}
                x2={cx}
                y1={top + 11}
                y2={top + 11}
                stroke={color}
                strokeWidth={1}
                opacity={row.accent ? 0.45 : 0.28}
                style={{
                  transform: shown ? 'scaleX(1)' : 'scaleX(0)',
                  transformBox: 'fill-box',
                  transformOrigin: 'left center',
                  transition: `transform 620ms ${Math.min(45 * i, 260)}ms var(--ease-out-quint)`,
                }}
              />
              <circle
                cx={cx}
                cy={top + 11}
                r={row.accent ? 6 : 5}
                fill={color}
                stroke="var(--color-paper-raised)"
                strokeWidth={2}
                opacity={shown ? 1 : 0}
                style={{ transition: `opacity 320ms ${Math.min(140 + 45 * i, 380)}ms ease-out` }}
              />
              <text
                x={flip ? cx - 12 : cx + 12}
                y={top + 15}
                textAnchor={flip ? 'end' : 'start'}
                className={`font-mono ${row.accent ? 'fill-accent-deep' : 'fill-ink'}`}
                fontSize={9.5}
                fontWeight={600}
                stroke="var(--color-paper-raised)"
                strokeWidth={3}
                strokeLinejoin="round"
                paintOrder="stroke"
                opacity={shown ? 1 : 0}
                style={{ transition: `opacity 320ms ${Math.min(240 + 45 * i, 470)}ms ease-out` }}
              >
                {narrow ? (
                  row.label
                ) : flip ? (
                  <>
                    <tspan className="fill-ink-faint" fontWeight={400}>
                      {row.note}
                      {'  '}
                    </tspan>
                    {row.label}
                  </>
                ) : (
                  <>
                    {row.label}
                    <tspan className="fill-ink-faint" fontWeight={400}>
                      {'  '}
                      {row.note}
                    </tspan>
                  </>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
