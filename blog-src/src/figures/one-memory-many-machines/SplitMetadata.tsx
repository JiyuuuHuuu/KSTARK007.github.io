// Megalon's split: index replicas in each host's DRAM, coherence records in the SCR, data in the LNR, plus SCR bytes per object.
import { usePlateReveal } from '../kit/plot';
import { SPLIT_METADATA_NOTE } from '@/content/posts/one-memory-many-machines/data';

const grow = (shown: boolean, delay: number) => ({
  transform: shown ? 'scaleX(1)' : 'scaleX(0)',
  transformBox: 'fill-box' as const,
  transformOrigin: 'left center',
  transition: `transform 620ms ${delay}ms var(--ease-out-quint)`,
});

export default function SplitMetadata() {
  const { ref, shown } = usePlateReveal(0.3);

  return (
    <div ref={ref}>
      <svg viewBox="0 0 520 296" className="block h-auto w-full overflow-visible" role="img" aria-label="Megalon's split metadata sharing">
        <title>Split metadata sharing</title>
        {[0, 1, 2].map((i) => {
          const x = 30 + 170 * i;
          return (
            <g key={i} opacity={shown ? 1 : 0} style={{ transition: `opacity 500ms ${120 * i}ms ease-out` }}>
              <rect x={x} y={14} width={150} height={64} rx={5} fill="var(--color-paper-raised)" stroke="var(--color-rule-strong)" strokeWidth={1.25} />
              <text x={x + 75} y={32} textAnchor="middle" className="fill-ink font-mono" fontSize={10} fontWeight={700}>
                {i === 2 ? 'Host N' : `Host ${i + 1}`} · local DRAM
              </text>
              <rect x={x + 14} y={40} width={122} height={28} rx={3} fill="var(--color-s4)" opacity={0.16} stroke="var(--color-s4)" />
              <text x={x + 75} y={58} textAnchor="middle" className="font-mono" fill="var(--color-s4)" fontSize={9.5} fontWeight={700}>
                INDEX REPLICA
              </text>
              <line x1={x + 75} y1={78} x2={x + 75} y2={106} stroke="var(--color-rule-strong)" strokeWidth={1} strokeDasharray="3 3" />
            </g>
          );
        })}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 600ms 350ms ease-out' }}>
          <rect x={30} y={106} width={460} height={100} rx={5} fill="var(--color-paper-raised)" stroke="var(--color-ink)" strokeWidth={1.25} />
          <text x={478} y={122} textAnchor="end" className="fill-ink-faint font-mono" fontSize={8.5}>
            CXL MEMORY
          </text>
          <rect x={40} y={126} width={92} height={62} rx={3} fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth={1.25} />
          <text x={86} y={140} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={8.5} fontWeight={700}>
            SCR
          </text>
          {Array.from({ length: 18 }, (_, i) => (
            <rect
              key={i}
              x={48 + (i % 6) * 13}
              y={146 + 13 * Math.floor(i / 6)}
              width={10}
              height={10}
              rx={1.5}
              fill="var(--color-accent)"
              opacity={shown ? 0.75 : 0}
              style={{ transition: `opacity 280ms ${Math.min(300 + 18 * i, 560)}ms ease-out` }}
            />
          ))}
          <text x={86} y={199} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={7.5}>
            coherence records · 4 B
          </text>
          <rect x={142} y={126} width={338} height={62} rx={3} fill="var(--color-s5)" opacity={0.14} stroke="var(--color-s5)" />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={156 + 64 * i} y={146} width={50} height={32} rx={3} fill="var(--color-paper-raised)" stroke="var(--color-s5)" strokeWidth={1} />
          ))}
          <text x={311} y={140} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={9}>
            data objects · 1–4 KB each
          </text>
          <text x={311} y={199} textAnchor="middle" className="font-mono" fill="var(--color-s5)" fontSize={7.5}>
            LNR
          </text>
        </g>
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 520ms 500ms ease-out' }}>
          <text x={30} y={232} className="fill-ink font-mono" fontSize={9.5} fontWeight={700}>
            SCR SPENT PER SHARED OBJECT
          </text>
          <text x={30} y={254} className="fill-ink-muted font-mono" fontSize={9}>
            HCMeta
          </text>
          <rect x={104} y={245} width={364} height={12} rx={2} fill="var(--color-s6)" opacity={0.75} style={grow(shown, 560)} />
          <text x={476} y={255} className="fill-ink font-mono" fontSize={9.5} fontWeight={700}>
            52 B
          </text>
          <text x={30} y={280} className="fill-ink-muted font-mono" fontSize={9}>
            Megalon
          </text>
          <rect x={104} y={271} width={28} height={12} rx={2} fill="var(--color-accent)" style={grow(shown, 640)} />
          <text x={140} y={281} className="fill-accent-deep font-mono" fontSize={9.5} fontWeight={700}>
            4 B · ~13× more objects
          </text>
        </g>
      </svg>
      <p className="mt-3 font-serif text-[12.5px] leading-relaxed text-ink-muted italic">{SPLIT_METADATA_NOTE}</p>
    </div>
  );
}
