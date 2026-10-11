// Prism's three tiers: manifest, memtable and BUL version numbers in the SCR; BUL data and immutable SSTable levels below the coherence boundary.
import { usePlateReveal } from '../kit/plot';

const LEVELS = [
  { label: 'L0', count: 3, y: 208 },
  { label: 'L1', count: 4, y: 244 },
  { label: 'Ln', count: 6, y: 280 },
];

export default function PrismArchitecture() {
  const { ref, shown } = usePlateReveal(0.3);

  return (
    <div ref={ref}>
      <svg viewBox="0 0 520 332" className="block h-auto w-full overflow-visible" role="img" aria-label="Prism's three-tier architecture">
        <title>Prism: memtable, BUL, SSTables</title>
        {/* The SCR: manifest, memtable and the BUL's version numbers. */}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 500ms ease-out' }}>
          <rect x={16} y={14} width={488} height={92} rx={5} fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth={1.5} />
          <text x={26} y={32} className="fill-accent-deep font-mono" fontSize={9} fontWeight={700}>
            SCR · 128 MB · hardware coherent
          </text>
          <rect x={26} y={42} width={82} height={52} rx={3} fill="var(--color-paper-raised)" stroke="var(--color-accent)" strokeWidth={0.75} />
          <text x={67} y={64} textAnchor="middle" className="fill-ink font-mono" fontSize={8.5} fontWeight={600}>
            MANIFEST
          </text>
          <text x={67} y={78} textAnchor="middle" className="fill-ink-faint font-mono" fontSize={8}>
            2 MB
          </text>
          <rect x={118} y={42} width={220} height={52} rx={3} fill="var(--color-paper-raised)" stroke="var(--color-accent)" strokeWidth={1} />
          <text x={228} y={62} textAnchor="middle" className="fill-ink font-mono" fontSize={9.5} fontWeight={700}>
            MEMTABLE · 64 MB
          </text>
          <text x={228} y={78} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={8}>
            cache for the most frequently written keys
          </text>
          <rect x={348} y={42} width={146} height={52} rx={3} fill="var(--color-paper-raised)" stroke="var(--color-accent)" strokeWidth={0.75} />
          <text x={421} y={60} textAnchor="middle" className="fill-ink font-mono" fontSize={8.5} fontWeight={600}>
            BUL VERSION #s
          </text>
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={356 + 9.5 * i} y={68} width={7} height={7} rx={1} fill="var(--color-accent)" opacity={0.7} />
          ))}
          <text x={421} y={89} textAnchor="middle" className="fill-ink-faint font-mono" fontSize={8}>
            62 MB · one per node
          </text>
        </g>
        {/* The coherence boundary. */}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 400ms 250ms ease-out' }}>
          <line x1={16} y1={118} x2={504} y2={118} stroke="var(--color-ink)" strokeWidth={1} strokeDasharray="6 4" />
          <text x={504} y={131} textAnchor="end" className="fill-ink-faint font-mono" fontSize={8}>
            ── the coherence boundary ──
          </text>
        </g>
        {/* The BUL's data in the LNR, tied to its version numbers above. */}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 500ms 350ms ease-out' }}>
          <rect x={70} y={134} width={380} height={56} rx={4} fill="var(--color-s4)" opacity={0.13} stroke="var(--color-s4)" strokeWidth={1.25} />
          <text x={260} y={156} textAnchor="middle" className="font-mono" fill="var(--color-s4)" fontSize={10} fontWeight={700}>
            BUL · in-place updatable · less frequently written keys
          </text>
          <text x={260} y={174} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={8.5}>
            data here, version numbers above; bounded so they all fit in the SCR
          </text>
          <line x1={421} y1={94} x2={330} y2={134} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
        </g>
        {/* Immutable SSTable levels. */}
        {LEVELS.map((level, i) => (
          <g
            key={level.label}
            opacity={shown ? 1 : 0}
            style={{ transition: `opacity 420ms ${Math.min(380 + 80 * i, 600)}ms ease-out` }}
          >
            <text x={30} y={level.y + 15} className="fill-ink-faint font-mono" fontSize={9} fontWeight={600}>
              {level.label}
            </text>
            {Array.from({ length: level.count }, (_, j) => (
              <rect
                key={j}
                x={62 + j * (392 / level.count)}
                y={level.y}
                width={392 / level.count - 8}
                height={22}
                rx={2.5}
                fill="var(--color-s5)"
                opacity={0.22}
                stroke="var(--color-s5)"
                strokeWidth={0.75}
              />
            ))}
            {i === 0 ? (
              <text x={470} y={level.y + 15} className="fill-ink-muted font-mono" fontSize={8}>
                flush ↓
              </text>
            ) : null}
            {i === 2 ? (
              <text x={470} y={level.y + 15} className="fill-ink-muted font-mono" fontSize={8}>
                compact ↓
              </text>
            ) : null}
          </g>
        ))}
        <text
          x={62}
          y={324}
          className="fill-ink-muted font-mono"
          fontSize={8.5}
          opacity={shown ? 1 : 0}
          style={{ transition: 'opacity 420ms 650ms ease-out' }}
        >
          SSTables · immutable · the least frequently written keys · no coherence tracking
        </text>
      </svg>
    </div>
  );
}
